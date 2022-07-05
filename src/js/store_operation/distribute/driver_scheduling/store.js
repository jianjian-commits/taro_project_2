import { action, observable, runInAction } from 'mobx'
import { Tip } from '@gmfe/react'
import moment from 'moment'
import { i18next } from 'gm-i18n'
import { searchDateTypes } from '../../../common/enum'
import _ from 'lodash'
import { getColorByDriverID, shortestPathSorting, dispatchMsg } from './util'
import { Request } from '@gm-common/request'
import utils from '../util'
import { pinyin } from '@gm-common/tool'
import { isInvalidLocation, isEndOfDay } from '../../../common/util'
import invalidDialog from './components/invalid_dialog'

const { getAddress, calculateTimeLimit } = utils
const isInvalidLocationKey = (key) => key === '0_0' || key === 'null_null'
const getGroupKey = ({ lat, lng }) => `${lat}_${lng}`

const today = moment().startOf('day')

class Store {
  @observable filter = {
    date_type: searchDateTypes.CYCLE.type, // date_type固定为运营周期
    begin_time: today,
    end_time: today,
    time_config_id: '',
    selected_route: {
      value: 0,
      name: i18next.t('全部线路'),
      text: i18next.t('全部线路'),
    },
    carrier_id_and_driver_id: [],
    area_id: [], // 1,2,3级地理标签
  }

  /* ------- filter --------- */
  // 服务时间
  @observable service_times = []

  // 线路列表
  @observable routeList = [
    { value: 0, name: i18next.t('全部线路') },
    { value: -1, name: i18next.t('无线路') },
  ]

  // 二级联动的司机列表
  @observable carrierDriverList = [{ value: -1, name: i18next.t('未分配') }]

  // 三级联动地理标签
  @observable address = [{ value: 0, name: i18next.t('全部') }]

  @action
  setFilter(key, value) {
    this.filter[key] = value
  }

  /* ------- map --------- */
  // 全部订单(按商户分组)
  @observable orderListGroupByCustomer = []

  orderMap = {}

  // 多条路线(二维数组)
  @observable polyLineArray = []

  // 总览
  @observable distributeOrderList = []

  @observable pagination = { count: 0 }

  // 订单池(用于modal分配司机)
  @observable orderPool = []

  @observable isOrderPoolShow = false

  // 地图模式
  @observable isMouseToolOpen = false

  /* ------- 时间选择相关 --------- */
  // 用户是否选择了日历
  @observable isChangeCal = false

  @action.bound
  setChange(key, status) {
    // 更改状态
    this[key] = status
  }

  @action.bound
  toggleDraggable() {
    this.isMouseToolOpen = !this.isMouseToolOpen
    // 通知map切换拖拽模式
    dispatchMsg('map-mouseTool-toggle', this.isMouseToolOpen)
  }

  @action.bound
  toggleOrderPool() {
    this.isOrderPoolShow = !this.isOrderPoolShow
  }

  @action.bound
  async init() {
    this.isMouseToolOpen = false

    this.getDriverList()
    this.getRouteList()
    await this.getServiceTimes() // getOrderList 依赖serviceTimes设置的数据
    this.handleInitTime() // 初始化时间
    this.getOrderList()
  }

  @action.bound
  getServiceTimes() {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const { data } = json
        runInAction(() => {
          this.service_times = data
          this.filter = {
            ...this.filter,
            time_config_id: (data[0] && data[0]._id) || null,
          }
        })
        return json
      })
  }

  @action.bound
  getDriverList() {
    return Request('/station/task/distribute/get_drivers')
      .get()
      .then((json) => {
        const [driverList, carriers] = json.data
        // 承运商列表
        const carrierList = carriers.slice()
        _.each(carrierList, (v) => {
          v.name = v.company_name
        })
        carrierList.unshift({ id: 0, name: i18next.t('全部承运商') })

        const _driverList = _.map(driverList, (obj) => {
          return {
            value: obj.id,
            name: `${obj.name}${obj.state ? '' : i18next.t('(停用)')}`,
            carrier_id: obj.carrier_id,
            state: obj.state,
          }
        })
        // 司机按承运商分组
        const driverGroup = _.groupBy(_driverList, 'carrier_id')
        const carrierDriverList = []

        _.each(carriers, (obj) => {
          const carrier = {
            name: obj.company_name,
            value: obj.id,
          }
          // 如果存在这个运营商
          if (driverGroup[obj.id]) {
            carrier.children = driverGroup[obj.id]
            carrierDriverList.push(carrier)
          }
        })

        runInAction(() => {
          this.carrierDriverList = [
            { value: -1, name: i18next.t('未分配') },
          ].concat(carrierDriverList)
        })
        return json
      })
  }

  @action.bound
  getRouteList() {
    return Request('/station/address_route/list')
      .data({ limit: 1000 })
      .get()
      .then((json) => {
        const { data = [] } = json
        const routeList = _.map(data, (item) => {
          return {
            value: item.id,
            name: item.name,
          }
        })
        routeList.push({ value: -1, name: i18next.t('无线路') })
        routeList.unshift({ name: i18next.t('全部线路') })

        runInAction(() => {
          this.routeList = routeList
        })
        return json
      })
  }

  // 生成搜索参数,limit很大默认拉全部订单
  generateReq(pagination = { offset: 0, limit: 999999 }) {
    const {
      time_config_id,
      begin_time,
      end_time,
      selected_route,
      carrier_id_and_driver_id,
      area_id,
    } = this.filter

    const req = {
      time_config_id,
      search_type: 'visual', // ❗️这里告诉后台不用做分页，优化后台查询性能
      cycle_start_time: isEndOfDay(begin_time),
      cycle_end_time: isEndOfDay(end_time),
      route_id: selected_route.value || null,
      driver_id:
        carrier_id_and_driver_id.length === 2
          ? carrier_id_and_driver_id[1]
          : null,
      ...pagination,
    }

    // 司机承运商筛选
    if (carrier_id_and_driver_id.length === 2) {
      req.carrier_id = carrier_id_and_driver_id[0]
      req.driver_id = carrier_id_and_driver_id[1]
    } else {
      if (carrier_id_and_driver_id[0] === -1) {
        // 未分配
        req.unassigned = 1
      } else {
        req.carrier_id = carrier_id_and_driver_id[0]
      }
    }

    const area_level = area_id.filter((v) => v.toString() !== '0').length - 1
    if (area_level >= 0) {
      req.area_level = area_level
      req.area_id = area_id[area_level]
    }

    return req
  }

  /**
   * 订单按商户归类
   * @param arr
   * @returns { object }
   */
  processOrder(arr) {
    // 根据坐标分组,每个有效的坐标都是地图上一个点
    const orderGroup = _.groupBy(arr, getGroupKey)
    let index = 0

    // 地理位置不符合规范的商户
    let invalidCustomerList = []
    // marker列表
    const orderListGroupByCustomer = []
    // 根据lat_lng聚合的订单数据(并且商户存在经纬度坐标)
    const orderMap = {}

    _.each(orderGroup, (orderList, lat_lng) => {
      // 没有经纬坐标的商户给予提示,并且不显示在地图上
      if (isInvalidLocationKey(lat_lng)) {
        const invalidList = orderList.map(
          ({ customer_name, id, address_id }) => ({
            id,
            customer_name,
            address_id: address_id[0],
          }),
        )
        invalidCustomerList = [...invalidCustomerList, ...invalidList]
      } else {
        // 坐标一样肯定就是一个商户
        const { lng, lat, customer_name, address_id } = orderList[0]
        const isAllOrderHaveDriver = _.every(
          orderList,
          (o) => !_.isNull(o.driver_id),
        )
        const firstDriver = _.find(orderList, 'driver_id') || {}
        const color = getColorByDriverID(firstDriver.driver_id)

        orderListGroupByCustomer.push({
          index: index++,
          orderList,
          orderSum: orderList.length,
          address_id,
          lat_lng,
          customer_name,
          isAllOrderHaveDriver,
          color,
          active: false,
          position: {
            longitude: lng,
            latitude: lat,
          },
        })

        orderMap[lat_lng] = orderList
      }
    })

    return {
      orderListGroupByCustomer,
      invalidCustomerList,
      orderMap,
    }
  }

  /**
   * 总览排序,并添加颜色字段
   * @param obj
   * @returns {Array}
   */
  processDistributeOrder(obj) {
    // 已分配司机名单
    const distributeOrderList = []
    for (const [key, val] of Object.entries(obj)) {
      val.driver_id = key
      val.color = getColorByDriverID(val.driver_id)
      val.pinyin = pinyin(val.driver_name, 'first_letter')
      distributeOrderList.push(val)
    }

    // 按商家数(降序)、销售金额(降序)、姓名首字母(升序)排序
    return _.orderBy(
      distributeOrderList,
      ['distribute_count', 'distribute_total_price', 'pinyin'],
      ['desc', 'desc', 'asc'],
    )
  }

  generatePolyLineArray(order) {
    const orderListGroupByDriver = _.groupBy(order, 'driver_id')
    // 删除没有司机的路线
    delete orderListGroupByDriver.null
    // 多条路线
    return _.map(orderListGroupByDriver, (orderList, driver_id) => {
      // polyline坐标数组
      const path = _.flow([
        (a) => _.filter(a, (item) => !isInvalidLocation(item.lat, item.lng)),
        (a) => _.uniqBy(a, getGroupKey),
        (a) => shortestPathSorting(a),
      ])(orderList)

      return {
        driver_id,
        color: getColorByDriverID(driver_id),
        path,
      }
    })
  }

  /**
   * 查询订单,排车
   * @param query  查询参数
   * @param checkTheCustomerLocation   是否需要检查商户地址的有效性
   * @returns {*}
   */
  @action.bound
  getOrderList(query, checkTheCustomerLocation = true) {
    // 每次拉订单,清理已选中池
    this.orderPool.clear()

    const req = {
      ...this.generateReq(),
      ...query,
    }

    return Request('/station/task/distribute/orders/get', { timeout: 60000 })
      .data(req)
      .post()
      .then((json) => {
        const { order, address, distribute_order } = json.data

        const orderRemoveLK = _.filter(
          order,
          (o) =>
            o.id.indexOf('LK') === -1 ||
            o.id.indexOf('c') === -1 ||
            o.id.indexOf('d') === -1,
        ) // LK单过滤掉,分仓没办法填坐标,不警告)

        const {
          orderListGroupByCustomer,
          invalidCustomerList,
          orderMap,
        } = this.processOrder(orderRemoveLK)

        // 订单地图,根据lat_lng分类
        this.orderMap = orderMap
        // 提醒用户去ma填地址
        checkTheCustomerLocation && invalidDialog(invalidCustomerList)

        runInAction(() => {
          this.orderListGroupByCustomer = orderListGroupByCustomer
          this.polyLineArray = this.generatePolyLineArray(orderRemoveLK)
          this.address = getAddress(address)
          this.pagination = json.pagination
          this.distributeOrderList = this.processDistributeOrder(
            distribute_order,
          )
        })
        // 根据地图上添加的覆盖物分布情况，自动缩放地图到合适的视野级别
        dispatchMsg('map-setFitView')

        return json
      })
  }

  /* -------------- 智能规划  -------------- */
  @action.bound
  autoAssign(query) {
    return Request('/station/task/distribute/auto_assign')
      .data(query)
      .post()
      .then((json) => {
        return json
      })
  }

  /* ----------- 左侧司机模态框 ------------- */
  @action.bound
  removeOrderFromOrderPool(index) {
    // 先删除选中池订单
    const [deletedOrder] = this.orderPool.splice(index, 1)
    const deletedOrderKey = getGroupKey(deletedOrder)

    const activatedMarkerOrderList = this.orderMap[deletedOrderKey].slice()

    // 判断当前marker的订单是否已经全部从订单池删除
    const shouldSetMarkerActiveFalse =
      _.intersectionBy(activatedMarkerOrderList, this.orderPool.slice(), 'id')
        .length === 0

    if (shouldSetMarkerActiveFalse) {
      const index = this.orderListGroupByCustomer.findIndex(
        (o) => o.lat_lng === deletedOrderKey,
      )
      if (index !== -1) {
        this.orderListGroupByCustomer[index].active = false
      }
    }
  }

  @action.bound
  setOrderPoolShow(bool) {
    this.isOrderPoolShow = bool
  }

  @action.bound
  unshiftOrderIntoOrderPool(orders) {
    this.orderPool.unshift(orders)
  }

  @action.bound
  postDriverAssign(driver_id) {
    const req = {
      order_ids: JSON.stringify(this.orderPool.map((o) => o.id)),
      assign_driver_id: driver_id,
      operation_type: driver_id ? 1 : 0, // 操作类型: 0 为取消分配 1 为分配
    }
    return Request('/station/task/distribute/edit_assign/v2')
      .data(req)
      .post()
      .then((json) => {
        Tip.success(i18next.t('保存成功!'))

        runInAction(() => {
          this.orderPool.clear()
          this.setOrderPoolShow(false)
        })

        return json
      })
  }

  /* ------------ marker ------------------ */
  @action.bound
  handleMarker(index) {
    this.setOrderPoolShow(true)

    const curItem = this.orderListGroupByCustomer[index]
    // 选中框
    curItem.active = !curItem.active
    if (curItem.active) {
      // 把商户订单添加到 候选池
      this.orderPool = curItem.orderList.concat(this.orderPool)
    } else {
      // 把商户订单从候选池去掉
      this.orderPool = _.pullAllBy(this.orderPool, curItem.orderList, 'id')
    }
  }

  @action.bound
  handleBatchPickMarker(rectanglePath) {
    // 矩形区域坐标
    const ring = _.map(rectanglePath, (point) => [point.lng, point.lat])
    // 判断点是否在矩形区域内
    const isPointInRing = (point) =>
      window.AMap.GeometryUtil.isPointInRing(point, ring)

    let bePickedOrderList = []

    // 遍历marker,区域内的marker激活,并放到orderPool里面
    this.orderListGroupByCustomer.forEach((marker) => {
      const { latitude, longitude } = marker.position

      if (isPointInRing([longitude, latitude])) {
        marker.active = true
        bePickedOrderList = [...bePickedOrderList, ...marker.orderList]
      }
    })

    // 如果框选了订单
    bePickedOrderList.length && this.setOrderPoolShow(true)

    // 框选的加进去,并且去重
    this.orderPool = _.uniqBy([...bePickedOrderList, ...this.orderPool], 'id')
  }

  @action.bound
  handleBatchPickMarkerByGMap(rectangleBounds) {
    let bePickedOrderList = []

    this.orderListGroupByCustomer.forEach((marker) => {
      const { latitude: lat, longitude: lng } = marker.position

      if (rectangleBounds.contains({ lat, lng })) {
        bePickedOrderList = [...bePickedOrderList, ...marker.orderList]
      }
    })

    // 如果框选了订单
    bePickedOrderList.length && this.setOrderPoolShow(true)

    // 框选的加进去,并且去重
    this.orderPool = _.uniqBy([...bePickedOrderList, ...this.orderPool], 'id')
  }

  @action.bound
  handleInitTime() {
    const time = _.find(
      this.service_times,
      (v) => v._id === this.filter.time_config_id,
    )
    const timeLimit = calculateTimeLimit(time)

    this.filter.begin_time = timeLimit.tMin
    this.filter.end_time = timeLimit.tMax
  }
}

export default new Store()
