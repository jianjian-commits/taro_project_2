import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { observable, action, computed, reaction } from 'mobx'
import { convertString2DateAndTime } from '../util'
import { orderState } from '../../common/filter'
import { searchDateTypes, initOrderType } from '../../common/enum'
import { calculateCycleTime, isEndOfDay } from '../../common/util'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'
import { getOrderTypeId } from '../../common/deal_order_process'
import globalStore from '../../stores/global'

const date = moment().startOf('day')
// !!!初始时间需要传当天的最后一刻，会展示为 24:00，实际传给后台为 第二天00:00
const endDate = moment().endOf('day')

const initFilter = {
  has_remark: '',
  is_print: '',
  is_inspect: '',
  dateType: searchDateTypes.ORDER.type,
  begin: date,
  end: endDate,
  time_config_id: '',
  orderStatus: 0,
  order_box_status: '',
  payStatus: 0,
  orderInput: '',
  in_query_search_text: '',
  route_id: null, // 线路
  citySelected: null,
  selected: null, // 报价单
  sortType: '', // 排序
  order_client: null, // 下单来源
  stockType: null, // 出库状态
  receive_way: '',
  pickUpSelected: null,
  routeSelected: null,
  searchType: 1, // 默认 按订单/商户 搜索,
  orderType: initOrderType, // 默认所有订单
  selectedLabel: null,
  customized_field: {},
  detail_customized_field: {},
  create_user_id: null,
}
@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_ORDER,
  selector: ['orders.filter.dateType'],
})
class Store {
  @observable statusTaskCycle = []

  @observable statusServiceTime = []

  // 司机
  @observable carrierDriverList = []

  @observable carrier_id_and_driver_id = []

  @observable areaList = []

  @observable buttonDisabled = false

  @observable selectedOrders = {
    selected: [],
    isAllSelected: false,
  }

  @observable type = '' // 用来判断是不是历史数据

  @observable merchantLabels = []

  @observable userInfo = []

  serviceTimeUpdater = reaction(
    () => {
      return this.orders.filter
    },
    (filter) => {
      const { time_config_id } = filter
      if (time_config_id) {
        DBActionStorage.set(
          ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_ORDER_TIME,
          time_config_id,
        )
      }
    },
  )

  @observable orders = {
    saleListFilter: [],
    pickUpList: [],
    service_times: [],
    filter: {
      ...initFilter,
    },
    list: [],
    routeList: [
      { text: i18next.t('全部线路'), value: null },
      { value: -1, text: i18next.t('无线路') },
    ],
    saleList: [],
    in_query: false,
    total_sale_money_with_freight: 0, // 订单总金额
    total_sale_money_with_freight_dict: {}, // 订单汇总金额(多币种)
    total_outstock_price_dict: {}, // 订单出库金额(多币种)
    total_sale_money_without_tax_dict: {}, // 订单销售额不含税(多币种)
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
    loading: false,
  }

  doFirstRequest = _.noop()

  @action
  handleChangeLabel = (v) => {
    this.orders.filter.selectedLabel = v
  }

  @action
  getMerchantLabels = () => {
    return Request('/station/address_label/list')
      .data({ limit: 1000 })
      .get()
      .then((json) => {
        this.merchantLabels = [
          { text: i18next.t('无商户标签'), value: -1 },
        ].concat(
          json.data.map((v) => ({
            text: v.name,
            value: v.id,
          })),
        )
      })
  }

  kingdeeSingleImport(query = {}) {
    return Request('/station/order/import/jindie/one')
      .data(query)
      .post()
      .then((json) => {
        return json
      })
  }

  kingdeeMutilImport(query = {}) {
    return Request('/station/order/import/jindie/more')
      .data(query)
      .post()
      .then((json) => {
        return json
      })
  }

  orderListExport(data) {
    return Request('/station/sales_analysis/orderdetail_v2').data(data).get()
  }

  fetchPospalOrder(date) {
    return Request('/openapi/app/pospal/sync_order')
      .data({ sync_date: moment(date).format('YYYY-MM-DD') })
      .post()
  }

  @action
  reset() {
    const { dateType, time_config_id } = this.orders.filter
    this.orders.filter = {
      ...initFilter,
      dateType,
      time_config_id,
    }
  }

  @action
  resetAll() {
    this.reset()
    this.orders.list = []
    this.type = ''
  }

  @computed
  get searchData() {
    const { filter, service_times } = this.orders
    const {
      has_remark,
      is_print,
      dateType,
      begin,
      end,
      time_config_id,
      orderStatus,
      orderInput,
      route_id,
      order_box_status,
      search_area,
      payStatus,
      selected,
      is_inspect,
      order_client,
      stockType,
      receive_way,
      pickUpSelected,
      searchType,
      orderType,
      selectedLabel,
      detail_customized_field,
      customized_field,
      create_user_id,
    } = filter
    // !!! 针对选择的结束时间需要多做一步处理, 当选择 24:00 时需要转换成 第二天00:00 传给后台
    // 运营周期不需要做这一步处理
    let start_date_new = isEndOfDay(begin)
    let end_date_new = isEndOfDay(end)
    if (dateType === searchDateTypes.CYCLE.type) {
      start_date_new = convertString2DateAndTime(begin)
      end_date_new = convertString2DateAndTime(end)
    }
    const { carrier_id_and_driver_id } = this
    let paramsTemp = {}
    const hasDriver = carrier_id_and_driver_id.slice().length >= 2
    if (this.type === undefined && moment(begin).add(3, 'M').isBefore(end)) {
      Tip.warning(i18next.t('时间范围不能超过三个月'))
      return null
    }
    if (this.type === 'history' && moment(begin).add(185, 'd').isBefore(end)) {
      Tip.warning(i18next.t('时间范围不能超过六个月'))
      return null
    }
    if (dateType === searchDateTypes.ORDER.type) {
      paramsTemp = {
        start_date_new,
        end_date_new,
      }
    } else if (dateType === searchDateTypes.RECEIVE.type) {
      paramsTemp = {
        receive_start_date_new: start_date_new,
        receive_end_date_new: end_date_new,
      }
    } else {
      const service_time = _.find(
        service_times,
        (s) => s._id === time_config_id,
      )
      paramsTemp = {
        time_config_id,
        cycle_start_time: calculateCycleTime(start_date_new, service_time)
          .begin,
        cycle_end_time: calculateCycleTime(end_date_new, service_time).end,
      }
    }

    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      paramsTemp = {
        ...paramsTemp,
        order_process_type_id,
      }
    }

    if (_.keys(detail_customized_field).length) {
      paramsTemp.detail_customized_field = JSON.stringify(
        detail_customized_field,
      )
    }

    if (_.keys(customized_field).length) {
      paramsTemp.customized_field = JSON.stringify(customized_field)
    }

    return {
      ...paramsTemp,
      route_id,
      order_box_status: order_box_status === '' ? null : order_box_status,
      client: order_client,
      query_type: dateType,
      search_text: orderInput,
      stock_type: stockType,
      receive_way: receive_way || null,
      pick_up_st_id: (pickUpSelected && pickUpSelected.value) || null,
      has_remark: has_remark === '' ? null : has_remark,
      is_print: is_print === '' ? null : is_print,
      inspect_status: is_inspect === '' ? null : is_inspect,
      status: !orderStatus ? null : orderStatus, // 不要传空
      pay_status: !payStatus ? null : payStatus,
      search_area: search_area || null, // 不要传空
      carrier_id: hasDriver ? carrier_id_and_driver_id[0] : null,
      driver_id: hasDriver ? carrier_id_and_driver_id[1] : null,
      salemenu_id: selected ? selected.value : null,
      search_type: searchType,
      address_label_id: selectedLabel?.value,
      create_user_id: searchType === 5 ? create_user_id?.value : null,
    }
  }

  @action
  filterChange(filter) {
    if (filter.dateType) {
      filter.begin = date
      filter.end = endDate
    }
    _.map(filter, (value, key) => {
      this.orders.filter[key] = value
    })
  }

  @action.bound
  orderListSearch(searchData, page, type) {
    this.type = type
    if (!searchData) return
    this.buttonDisabled = true
    if (page) {
      searchData = Object.assign(searchData, page)
    }

    this.orders.loading = true

    return Request('/station/orders')
      .data(searchData)
      .timeout(60000)
      .get()
      .then((json) => {
        // 搜索按钮防止连续点击
        this.buttonDisabled = false
        const filter = { ...this.orders.filter }
        // in_query为true表示不在当前选择的时间范围内
        if (json.data.in_query) {
          filter.begin = date
          filter.end = endDate
          filter.in_query_search_text = searchData.search_text
        } else {
          filter.in_query_search_text = ''
        }
        this.orders = Object.assign(
          {},
          { ...this.orders, total_outstock_price_dict: { CNY: 0 } },
          json.data,
          {
            in_query: json.data.in_query,
            loading: false,
            filter,
          },
        )
        this.orderSelect([])
        return {
          data: json.data.list,
          pagination: json.data.pagination,
        }
      })
      .catch(() => {
        this.buttonDisabled = false
      })
  }

  @action.bound
  getDriverList() {
    return Request('/station/task/distribute/get_drivers')
      .data()
      .get()
      .then((json) => {
        const driverList = json.data[0]
        const carriers = json.data[1]
        const carrierDriverList = []

        const _driverList = _.map(driverList, (obj) => {
          return {
            value: obj.id,
            name: `${obj.name}${obj.state ? '' : i18next.t('(停用)')}`,
            carrier_id: obj.carrier_id,
          }
        })
        // 司机按承运商分组
        const driverGroup = _.groupBy(_driverList, 'carrier_id')

        _.each(carriers, (obj) => {
          const carrier = {
            name: obj.company_name,
            value: obj.id,
          }
          // 如果存在这个运营商
          if (driverGroup[obj.id]) {
            carrier.children = driverGroup[obj.id]
          }
          carrierDriverList.push(carrier)
        })
        return (this.carrierDriverList = carrierDriverList)
      })
  }

  @action
  getPickUpList() {
    return Request('/station/pick_up_station/list')
      .data({ limit: 0 })
      .get()
      .then(
        action((json) => {
          this.orders.filter = {
            ...this.orders.filter,
          }
          this.orders.pickUpList = _.map(json.data, (item) => {
            return { value: item.id, text: item.name }
          })
          return json
        }),
      )
  }

  @action
  driverSelect(carrier_id_and_driver_id) {
    this.carrier_id_and_driver_id = carrier_id_and_driver_id
  }

  @action
  orderSelect(selected) {
    const list = [...this.orders.list]
    let isAllSelected = false
    const filterList = _.filter(list, (order) => {
      // 去掉订单不可选的状态
      return order.status < 15
    })
    if (filterList.length === selected.length) {
      isAllSelected = true
    }
    this.selectedOrders = {
      selected,
      isAllSelected,
    }
  }

  @action
  orderDelete(order_id, index, isOldOrder = false, remark) {
    return Request(
      isOldOrder ? '/station/order/delete_old' : '/station/order/delete',
    )
      .data({ order_id, remark })
      .post()
      .then(() => {
        const list = [...this.orders.list]
        list.splice(index, 1)

        this.orders.list = list
        this.orders.pagination = Object.assign({}, this.orders.pagination, {
          count: --this.orders.pagination.count,
        })
      })
  }

  @action.bound
  orderStatusUpdate(status, ids, remark = undefined) {
    return Request('/station/order/set_status')
      .data({
        order_ids: ids.join(','),
        status,
        batch_remark: remark,
      })
      .post()
      .then((json) => {
        const list = [...this.orders.list]

        _.each(ids, (order_id) => {
          _.every(list, (order) => {
            if (order.id === order_id) {
              // 订单状态只能往大的改
              if (status > order.status) {
                order.status = Number(status)
                delete order.status_tmp
              }

              delete order.edit
              return false
            }
            return true
          })
        })
        this.orders.list = list

        Tip.success(
          i18next.t('KEY76', {
            VAR1: json.data.count,
            VAR2: orderState(status),
          }) /* src:`修改完成,修改${json.data.count}个订单状态为${orderState(status)}` => tpl:修改完成,修改${VAR1}个订单状态为${VAR2} */,
        )
        return json
      })
  }

  @action
  orderStateEditableToggle(index) {
    const list = [...this.orders.list]
    const order = list[index]

    if (order.edit) {
      delete order.edit
      delete order.status_tmp
    } else {
      order.edit = true
      order.status_tmp = order.status
    }
    this.orders.list = list
  }

  @action
  orderSingleStatusChange(index, status) {
    const list = [...this.orders.list]
    const order = list[index]
    order.status_tmp = status
    this.orders.list = list
  }

  @action.bound
  orderStatusPresetUpdate(
    start_date,
    end_date,
    start_date_new,
    end_date_new,
    from_status = undefined,
    search_text = undefined,
    count,
    to_status,
    batch_remark = undefined,
  ) {
    const { filter } = this.orders
    const { statusTaskCycle } = this
    const query = {
      from_status,
      search_text,
      count,
      to_status,
      batch_remark,
      query_type: filter.dateType,
    }

    const begin = isEndOfDay(start_date_new)
    const end = isEndOfDay(end_date_new)

    if (filter.dateType === searchDateTypes.ORDER.type) {
      Object.assign(query, {
        start_date_new: begin,
        end_date_new: end,
      })
    } else if (filter.dateType === searchDateTypes.CYCLE.type) {
      const _start_date = moment(start_date).format('YYYY-MM-DD')
      const _end_date = moment(start_date).format('YYYY-MM-DD')
      // 依赖 statusTaskCycle
      let tail = statusTaskCycle[0].cycle_start_time.slice(-8)
      tail = tail.replace(/:/g, '-')
      Object.assign(query, {
        time_config_id: filter.time_config_id,
        start_cycle_time: _start_date + '-' + tail,
        end_cycle_time: _end_date + '-' + tail,
      })
    } else if (filter.dateType === searchDateTypes.RECEIVE.type) {
      Object.assign(query, {
        receive_start_date_new: begin,
        receive_end_date_new: end,
      })
    }

    return Request('/station/order/update/status/preconfig', { timeout: 60000 })
      .data(query)
      .post()
      .then((json) => {
        Tip.success(
          i18next.t('KEY88', {
            VAR1: json.data.success,
            VAR2: orderState(to_status),
          }) /* src:`更新完成,共${json.data.success}个订单状态更新为${orderState(to_status)}` => tpl:更新完成,共${VAR1}个订单状态更新为${VAR2} */,
        )

        if (json.data.failed > 0) {
          Tip.warning(
            i18next.t('KEY89', {
              VAR1: json.data.failed,
            }) /* src:`更新失败,共${json.data.failed}个订单状态更新失败,请稍后再次尝试更新` => tpl:更新失败,共${VAR1}个订单状态更新失败,请稍后再次尝试更新 */,
          )
        }
        return json
      })
  }

  @action.bound
  orderStatusSubWarehouseUpdate(
    time_config_id,
    cycle_start_time,
    status,
    batch_remark = undefined,
  ) {
    const query = {
      time_config_id,
      cycle_start_time,
      status,
      batch_remark,
    }
    return Request('/station/order/update/status/child_station')
      .data(query)
      .post()
      .then((json) => {
        Tip.success(
          i18next.t('KEY88', {
            VAR1: json.data.success,
            VAR2: orderState(status),
          }) /* src:`更新完成,共${json.data.success}个订单状态更新为${orderState(status)}` => tpl:更新完成,共${VAR1}个订单状态更新为${VAR2} */,
        )

        if (json.data.failed > 0) {
          Tip.warning(
            i18next.t('KEY89', {
              VAR1: json.data.failed,
            }) /* src:`更新失败,共${json.data.failed}个订单状态更新失败,请稍后再次尝试更新` => tpl:更新失败,共${VAR1}个订单状态更新失败,请稍后再次尝试更新 */,
          )
        }

        return json
      })
  }

  @action
  fetchStationServiceTime() {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const serviceTimes = json.data
        this.orders.service_times = serviceTimes

        const localId = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_ORDER_TIME,
        )
        const { initServiceTimeId } = DBActionStorage.helper
        const curId = this.orders.filter.time_config_id
        // 初始化运营时间
        initServiceTimeId(curId, localId, serviceTimes, (val) => {
          this.filterChange({ time_config_id: val })
        })
      })
  }

  @action.bound
  getRouteList(query = { limit: 1000 }) {
    return Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        const routeList = _.map(json.data || [], (item) => {
          return {
            value: item.id,
            text: item.name,
          }
        })
        routeList.push({ value: -1, text: i18next.t('无线路') })
        routeList.unshift({ text: i18next.t('全部线路'), value: null })
        this.orders = {
          ...this.orders,
          routeList,
        }
      })
  }

  // 获取服务时间 g_var => global
  @action.bound
  getStatusServiceTime() {
    const query = {}
    if (globalStore.isSupply()) {
      query.station_id = globalStore.purchaseInfo.seller_station_id
    }
    return Request('/service_time/list')
      .data(query)
      .get()
      .then((json) => {
        this.statusServiceTime = json.data
        return json
      })
  }

  @action.bound
  getStatusTaskCycle(service_time_id) {
    return Request('/service_time/cycle_start_time')
      .data({
        cycle_days: 2,
        id: service_time_id,
      })
      .get()
      .then((json) => {
        this.statusTaskCycle = json.data
      })
  }

  @action.bound
  getSaleList() {
    return Request('/salemenu/sale/list')
      .get()
      .then((json) => {
        const saleList = _.map(json.data, (item) => ({
          text: item.name,
          value: item.id,
        }))
        this.orders.saleList = saleList
        this.orders.saleListFilter = saleList
        return json.data
      })
  }

  // 获取所有用户
  @action.bound
  getUserList = () =>
    Request('/gm_account/station/user/search')
      .data({ offset: 0, limit: 999 })
      .get()
      .then((json) => {
        this.userInfo = _.map(json.data.users, (item) => {
          return { text: item.username, value: item.id }
        })
        return json.data
      })

  setDoFirstRequest(func) {
    // doFirstRequest有ManagePagination提供
    this.doFirstRequest = func
  }
}

export default new Store()
