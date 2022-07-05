import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'
import { Request } from '@gm-common/request'
import { observable, action, computed, reaction } from 'mobx'
import { searchDateTypes, initOrderType } from '../../common/enum'
import { convertString2DateAndTime, filterIdForCategories, isLK } from '../util'
import { calculateCycleTime, isEndOfDay } from '../../common/util'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'
import { getOrderTypeId } from '../../common/deal_order_process'
import globalStore from '../../stores/global'
// import { toJS } from 'mobx'

const date = moment().startOf('day')
// !!!初始结束时间需要传当天的最后一刻，会展示为 24:00，实际传给后台为 第二天00:00
const endDate = moment().endOf('day')

const initFilter = {
  dateType: searchDateTypes.ORDER.type,
  time_config_id: '',
  begin: date,
  end: endDate,
  orderInput: '',
  route_id: null, // 线路
  categoriesSelected: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  batch_remark: '',
  is_weigh: '',
  weighted: '',
  sku_box_status: '',
  status: 0,
  pay_status: 0,
  batchRemarkList: [], // 分拣备注
  selected: null, // 报价单
  isAllSelected: false,
  receive_way: '',
  pickUpSelected: null,
  sortType: '', // 排序
  aggregate_sort_type: '', // 下单数排序
  is_price_timing: null,
  routeSelected: null,
  status_of_stock: 1, // 缺货状态默认全部,
  orderType: initOrderType, // 默认所有订单
  customized_field: {},
  detail_customized_field: {},
}

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_SKU,
  selector: ['skus.filter.dateType'],
})
class Store {
  @observable skuBatch = {
    list: [],
    loading: false,
  }

  @observable selectedSkus = []

  @observable statusTaskCycle = []

  @observable statusServiceTime = []

  // 分拣备注列表获取
  @observable batchRemarkList = []

  // 同步失败商品列表
  @observable failedSkuList = []

  // 同步失败商品选择列表
  @observable slectedFailedSkuList = []

  // 删除失败页面数据
  @observable failedDeleteList = []

  // 替换失败页面数据
  @observable failedReplaceList = []

  @observable buttonDisabled = false

  serviceTimeUpdater = reaction(
    () => {
      return this.skus.filter
    },
    (filter) => {
      const { time_config_id } = filter
      if (time_config_id) {
        DBActionStorage.set(
          ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_SKU_TIME,
          time_config_id,
        )
      }
    },
  )

  @observable skus = {
    saleListFilter: [],
    service_times: [],
    pickUpList: [],
    filter: {
      ...initFilter,
    },
    list: [],
    routeList: [
      { text: i18next.t('全部线路'), value: null },
      { value: -1, text: i18next.t('无线路') },
    ],
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
    saleList: [],
    loading: false,
  }

  doFirstRequest = _.noop()

  @action
  reset() {
    const { dateType, time_config_id } = this.skus.filter
    this.skus.filter = { ...initFilter, dateType, time_config_id }
  }

  @action
  resetAll() {
    this.reset()
    this.skus.list = []
  }

  @computed
  get searchData() {
    const { filter, service_times } = this.skus
    const {
      dateType,
      begin,
      end,
      time_config_id,
      orderInput,
      categoriesSelected,
      batch_remark,
      is_weigh,
      weighted,
      status,
      pay_status,
      selected,
      route_id,
      receive_way,
      pickUpSelected,
      is_price_timing,
      status_of_stock,
      sku_box_status,
      orderType,
      detail_customized_field,
      customized_field,
    } = filter
    // !!! 针对选择的结束时间需要多做一步处理, 当选择 24:00 时需要转换成 第二天00:00 传给后台
    let start_date_new = isEndOfDay(begin)
    let end_date_new = isEndOfDay(end)
    if (dateType === searchDateTypes.CYCLE.type) {
      start_date_new = convertString2DateAndTime(begin)
      end_date_new = convertString2DateAndTime(end)
    }

    if (moment(begin).add(2, 'M').isBefore(end)) {
      Tip.warning(i18next.t('时间范围不能超过二个月'))
      return null
    }
    const batch_remark_is_null =
      batch_remark === 'batch_remark_is_null' ? 1 : null
    const order_process_type_id = getOrderTypeId(orderType)
    let orderProcessType = {}
    if (order_process_type_id !== null) {
      orderProcessType = {
        order_process_type_id,
      }
    }

    const paramsTemp = {
      route_id,
      is_price_timing,
      query_type: dateType,
      search_text: orderInput,
      status: status || null,
      pay_status: pay_status || null,
      salemenu_id: selected ? selected.value : null,
      category1_ids: filterIdForCategories(categoriesSelected.category1_ids),
      category2_ids: filterIdForCategories(categoriesSelected.category2_ids),
      pinlei_ids: filterIdForCategories(categoriesSelected.pinlei_ids),
      batch_remark_is_null,
      sku_box_status: sku_box_status === '' ? null : sku_box_status,
      batch_remark:
        batch_remark === '' || batch_remark_is_null ? null : batch_remark,
      is_weigh: is_weigh === '' ? null : is_weigh,
      weighted: weighted === '' ? null : weighted,
      status_of_stock: status_of_stock === 1 ? null : status_of_stock,
      ...orderProcessType,
      pick_up_st_id:
        pickUpSelected && pickUpSelected.value !== ''
          ? pickUpSelected.value
          : null,
      receive_way: receive_way === '' ? null : receive_way,
    }

    if (_.keys(detail_customized_field).length) {
      paramsTemp.detail_customized_field = JSON.stringify(
        detail_customized_field,
      )
    }

    if (_.keys(customized_field).length) {
      paramsTemp.customized_field = JSON.stringify(customized_field)
    }

    if (dateType !== searchDateTypes.CYCLE.type) {
      return {
        start_date_new,
        end_date_new,
        ...paramsTemp,
      }
    } else {
      const service_time = _.find(
        service_times,
        (s) => s._id === time_config_id,
      )
      return {
        time_config_id,
        start_date_new: calculateCycleTime(start_date_new, service_time).begin,
        end_date_new: calculateCycleTime(end_date_new, service_time).end,
        ...paramsTemp,
      }
    }
  }

  @action.bound
  skuListSearch(params, page = null) {
    const { skus } = this
    const { isAllSelected } = skus.filter
    const isOldOrderEditable = globalStore.hasPermission(
      'edit_old_order_change',
    )
    if (!params) return
    this.buttonDisabled = true
    this.skus.loading = true
    params = Object.assign(params, page)

    if (params.order_id) {
      delete params.start_date_new
      delete params.end_date_new
    }

    return Request('/station/order/order_sku_list', {
      timeout: 60000,
    })
      .data(params)
      .get()
      .then((json) => {
        // 搜索按钮防止连续点击
        this.buttonDisabled = false
        _.each(json.data.list, (sku, index) => {
          sku._id = `${index}`
          sku.is_edit = false
          sku.temp_std_real_quantity = sku.std_real_quantity
          sku.temp_real_quantity = sku.real_quantity
          if (this.canSelect(isOldOrderEditable, sku)) {
            sku._selected = isAllSelected
          }
        })

        this.skus = Object.assign({}, this.skus, json.data, {
          loading: false,
        })
        if (!isAllSelected) this.selectedSkus = []
        return {
          data: json.data.list,
          pagination: json.data.pagination,
        }
      })
      .catch(() => {
        this.buttonDisabled = false
      })
  }

  @action
  updateSku(index, key, value) {
    const list = this.skus.list.slice()
    list[index][key] = value
    this.skus.list = list
  }

  @action
  filterChange(filter) {
    if (filter.dateType) {
      filter.begin = date
      filter.end = date
    }
    _.map(filter, (value, key) => {
      this.skus.filter[key] = value
    })
  }

  @action
  skuSelect(selected, isOldOrderEditable = false) {
    const list = [...this.skus.list]
    _.forEach(list, (sku) => {
      sku._selected = false
    })
    _.forEach(selected, (item) => {
      const sku = list[item]
      if (this.canSelect(isOldOrderEditable, sku)) {
        sku._selected = true
      }
    })
    this.selectedSkus = selected
    this.skus.list = list
  }

  /**
   * @description: 选择订单
   * @param {boolean} isOldOrderEditable 是否可以追加修改订单
   * @param {boolean} checked 全选是否勾上
   */
  @action
  skuListSelect(isOldOrderEditable = false, checked) {
    const list = [...this.skus.list]
    let selected = []

    _.each(list, (sku) => {
      if (this.canSelect(isOldOrderEditable, sku)) {
        sku._selected = checked
        checked && selected.push(sku._id)
      }
    })
    if (!checked) selected = []

    if (checked && !selected.length && !isOldOrderEditable) {
      Tip.warning(i18next.t('订单都在配送中，且该账号没有【追加修改】的权限'))
    }
    this.selectedSkus = selected
    this.skus.list = list
  }

  // 修改list数据: 修改出库数
  @action.bound
  updateRealQuantity(index, data) {
    return Request('/station/order/real_quantity/update')
      .data({
        order_id: data.order_id,
        sku_id: data.id,
        std_real_quantity: data.std_real_quantity,
        detail_id: data.detail_id,
      })
      .post()
      .then((json) => {
        const { std_real_quantity, sale_money, is_weigh, weighted } = json.data
        const list = this.skus.list || []
        const filterList = _.map(list, (v, i) => {
          if (i === index) {
            // 更新出库数（基本单位）
            v.std_real_quantity = std_real_quantity
            // 更新出库数（销售单位）
            v.real_quantity = parseFloat(
              Big(std_real_quantity).div(v.sale_ratio).toFixed(2),
            )
            v.sale_money = sale_money
            v.is_weigh = is_weigh
            v.weighted = weighted
          }
          return v
        })
        this.skus = Object.assign({}, this.skus, {
          list: filterList,
          loading: false,
        })
        return true
      })
      .catch(() => {
        return false
      })
  }

  @action
  updateSkuPrice() {
    const { skuBatch } = this
    let price_data_new = []
    _.each(skuBatch.list, (sku) => {
      const sale_price = parseFloat(sku.sale_price)
      const std_sale_price_forsale = parseFloat(sku.std_sale_price_forsale)

      // 单价有更新才添加数据
      if (sale_price && std_sale_price_forsale) {
        const price_data = _.map(sku.detail_ids, (id, index) => {
          let order_id = null
          if (id === 0) {
            order_id = sku.orders[index].order_id
          }
          return {
            sku_id: sku.sku_id,
            detail_id: id,
            sale_price,
            std_sale_price_forsale,
            order_id:
              order_id ||
              _.find(
                sku.orders,
                (order) =>
                  order.detail_id === id &&
                  (order.sku_id || order.id) === sku.sku_id,
              ).order_id,
          }
        })
        price_data_new = price_data_new.concat(price_data)
      }
    })

    if (!price_data_new.length) {
      Tip.warning(i18next.t('请修改价格后再保存'))
      return Promise.reject(new Error('updateSkuPriceErr'))
    }

    return Request('/station/order/update_sku_price')
      .data({ price_data_new: JSON.stringify(price_data_new) })
      .post()
  }

  @action.bound
  getBatchList(query = {}) {
    return Request('/station/order/remark/get')
      .data(query)
      .get()
      .then((json) => {
        this.batchRemarkList = json.data
        return json.data
      })
  }

  @action.bound
  getRouteList(query = { limit: 1000 }) {
    return Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        const routeListTemp = json.data || []
        const routeList = _.map(routeListTemp, (item) => {
          return {
            value: item.id,
            text: item.name,
          }
        })
        routeList.push({ value: -1, text: i18next.t('无线路') })
        routeList.unshift({ text: i18next.t('全部线路'), value: null })
        this.skus = {
          ...this.skus,
          routeList,
        }
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
        this.skus.saleList = saleList
        this.skus.saleListFilter = saleList
        return json.data
      })
  }

  @action.bound
  fetchStationServiceTime() {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const serviceTimes = json.data
        this.skus.service_times = serviceTimes

        const time_config_id = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_SKU_TIME,
        )
        const { initServiceTimeId } = DBActionStorage.helper
        const curId = this.skus.filter.time_config_id
        // 初始化运营时间
        initServiceTimeId(curId, time_config_id, serviceTimes, (val) => {
          this.filterChange({ time_config_id: val })
        })
      })
  }

  // 获取服务时间
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
  getSkuBatchList(params, needDetailId) {
    this.skuBatch = {
      list: [],
      loading: true,
    }
    return Request('/station/order/order_sku_list', {
      timeout: 60000,
    })
      .data(Object.assign(params, { return_all: 'yes' }))
      .get()
      .then((json) => {
        // 勾选全选时默认赋予每一个change_type为0
        _.forEach(json.data, (sku) => {
          sku.change_type = 0
        })
        // 处理一下detail_id
        let list = json.data
        if (needDetailId) {
          // 处理数据
          list = _.map(json.data, (item) => {
            const detail_ids = _.map(item.orders, (order) => order.detail_id)
            const orders = _.map(item.orders, (order) => ({
              ...order,
              sku_id: item.sku_id,
            }))
            return {
              ...item,
              detail_ids,
              orders,
            }
          })
        }
        this.skuBatch = {
          list: this.skuBatchFilterLK(list),
          loading: false,
        }
      })
  }

  @action
  selectedSkuSort(type) {
    // type 需要处理的列表类型 0 -- 按商品查看列表勾选 / 1 -- 失败商品列表勾选
    let selected = []
    if (type === 0) {
      selected = _.filter(this.skus.list, (sku) => {
        return sku._selected
      })
    } else {
      _.each(this.failedSkuList.slice(), (item, i) => {
        if (
          _.findIndex(
            this.slectedFailedSkuList.slice(),
            (index) => index === i,
          ) !== -1
        ) {
          selected.push(item)
        }
      })
    }

    // 加入失败原因
    const group = _.groupBy(selected, 'id')
    const list = _.map(group, (skus) => {
      return {
        sale_ratio: skus[0].sale_ratio,
        sku_name: skus[0].name,
        sale_unit_name: skus[0].sale_unit_name,
        std_unit_name_forsale: skus[0].std_unit_name_forsale,
        sku_id: skus[0].id,
        salemenu_name: skus[0].salemenu_name,
        salemenu_id: skus[0].salemenu_id,
        fee_type: skus[0].fee_type,
        orders: skus,
        reason_type: skus[0].reason_type || 0,
        detail_ids: _.map(skus, (sku) => sku.detail_id),
      }
    })
    this.skuBatch = {
      list: this.skuBatchFilterLK(list),
      loading: false,
    }
  }

  skuBatchFilterLK(list) {
    return _.map(list, (v) => {
      return {
        ...v,
        orders: _.filter(v.orders, ({ order_id }) => !isLK(order_id)),
      }
    }).filter((v) => v.orders.length)
  }

  @action
  priceChangeInSkuBatch(from, index, _price) {
    const list = [...this.skuBatch.list]
    const sku = list[index]
    // 这里如果_price为空，不能把price赋值为0，否则会有问题
    const price = _price

    if (from === 'std') {
      sku.std_sale_price_forsale = price
      sku.sale_price = Big(price || 0)
        .times(sku.sale_ratio)
        .toFixed(2)
    } else {
      sku.sale_price = price
      sku.std_sale_price = Big(price || 0)
        .div(sku.sale_ratio)
        .toFixed(2)
      sku.std_sale_price_forsale = Big(price || 0)
        .div(sku.sale_ratio)
        .toFixed(2)
    }

    this.skuBatch = {
      list,
      loading: false,
    }
  }

  @action
  skuBatchClear() {
    this.skuBatch = {
      list: [],
      loading: false,
    }
  }

  // 商品同步至报价单
  @action
  batchSyncToSalemenu(data) {
    return Request('/station/order/batch_price_sync_to_sku').data(data).post()
  }

  // 同步最新单价
  @action
  batchSyncLatestPrice(list, type) {
    return Request('/station/order/update_sku_price_auto_new')
      .data({
        update_list: JSON.stringify(list),
        price_unit_type: type,
      })
      .post()
  }

  // 手动进入采购任务
  @action
  createPurchaseByOrder(data) {
    return Request('/purchase/task/create_by_order').data(data).post()
  }

  // 商品修改失败列表,异步任务task.type -- 17、同步报价单 3、同步最新单价 18、手动修改单价
  @action
  getFailedSkusList(id, type) {
    let url = ''
    if (type === 17) {
      url = '/station/order/batch_price_sync_to_sku/result'
    } else if (type === 3) {
      url = '/station/order/update_sku_price_result'
    } else {
      url = '/station/order/update_sku_price/result'
    }

    return Request(url)
      .data({ task_id: id })
      .get()
      .then((json) => {
        // 提供一个唯一的key以供选择
        let list = json.data.slice()
        list = _.map(list, (sku, i) => {
          return {
            ...sku,
            _skuId: i,
          }
        })
        this.failedSkuList = list
      })
  }

  @action
  selectFailedSkus(selected) {
    this.slectedFailedSkuList = selected
  }

  @action
  selectAllFailedSkus(all) {
    let selected = []
    if (all) {
      selected = _.map(
        _.filter(this.failedSkuList, (v) => v.reason_type !== 1),
        (v) => v._skuId,
      )
    }
    this.slectedFailedSkuList = selected
  }

  @action
  replaceChangeInSkuBatch(index, name, e) {
    const list = [...this.skuBatch.list]
    // 获取商品备注取的值
    if (name === 'spu_remark') {
      e = e.target.value
    }
    list[index][name] = e
    this.skuBatch = {
      list,
      loading: false,
    }
  }

  @action
  deleteReplaceSku(index) {
    const list = [...this.skuBatch.list]
    list.splice(index, 1)
    this.skuBatch = {
      list,
      loading: false,
    }
  }

  @action
  handleSearchList(index, item, searchText) {
    const list = [...this.skuBatch.list]
    const searchData = {
      salemenu_id: item.salemenu_id,
      search_text: searchText,
    }
    if (searchText !== '') {
      return Request('/station/order/order_change_sku/search')
        .data({ ...searchData })
        .post()
        .then(
          action((json) => {
            const searchList = _.map(json.data, (item) => {
              return {
                text: item.sku_name,
                value: item.sku_id,
                original: item,
              }
            })
            list[index].search_list = searchList
            this.skuBatch.list = list
          }),
        )
    }
  }

  @action
  handleSelectItem(index, item) {
    const list = [...this.skuBatch.list]
    list[index].selected_data = item
    this.skuBatch = {
      list,
      loading: false,
    }
  }

  @action
  getPickUpList() {
    return Request('/station/pick_up_station/list')
      .data({ limit: 0 })
      .get()
      .then(
        action((json) => {
          this.skus.filter = {
            ...this.skus.filter,
          }
          this.skus.pickUpList = _.map(json.data, (item) => {
            return { value: item.id, text: item.name }
          })
          return json
        }),
      )
  }

  @action
  replaceBatchSku() {
    const list = [...this.skuBatch.list]
    let replaceDetails = []
    _.forEach(list, (sku) => {
      const orderInfos = _.map(sku.orders, (item) => {
        return {
          order_id: item.order_id,
          quantity: item.quantity,
          resname: item.resname,
          detail_id: item.detail_id,
        }
      })
      sku.order_infos = orderInfos
    })
    const filterList = _.filter(list, (sku) => {
      /**
       * 1.备注长度要小于100 sku.spu_remark?.length <= 100
       */
      return (
        (sku.spu_remark?.length || 0) <= 100 &&
        sku.selected_data &&
        (sku.change_quantity > 0 || sku.change_type === 0)
      )
    })
    if (filterList.length === list.length) {
      // 过滤之后的数据如果等于列表的数据说明校验通过
      replaceDetails = _.map(list, (sku) => {
        return {
          sku_id: sku.sku_id,
          order_infos: sku.order_infos,
          new_sku_id: sku.selected_data.original.sku_id,
          change_type: sku.change_type,
          change_quantity: Number(sku.change_quantity),
          spu_remark: sku.spu_remark || '',
          salemenu_name: sku.salemenu_name,
        }
      })
      return Request('/station/order/batch_change_skus')
        .data({ change_details: JSON.stringify(replaceDetails) })
        .post()
    } else {
      Tip.warning(i18next.t('存在替换商品信息填写不完整或信息填写错误'))
      return Promise.reject(new Error('replaceBatchSkuErr'))
    }
  }

  @action
  // 批量删除Sku
  batchDeleteSkuApi(data) {
    return Request('/station/order/batch_delete_skus').data(data).post()
  }

  @action
  // 获取失败页数据
  getFaildSkuResult(data, type) {
    return Request(`/station/order/batch_${type}_skus_result`)
      .data(data)
      .get()
      .then((json) => {
        if (type === 'delete') {
          this.failedDeleteList = json.data
        } else {
          this.failedReplaceList = json.data
        }
      })
  }

  setDoFirstRequest(func) {
    // doFirstRequest有ManagePagination提供
    this.doFirstRequest = func
  }

  /**
   * @description: 如果有【追加修改】权限或订单是待配送的，都可以选择
   * @param {boolean} isOldOrderEditable
   * @param {订单数据} sku
   * @return {boolean} 是否能否选择改订单数据
   */
  canSelect(isOldOrderEditable, sku) {
    return isOldOrderEditable || (sku.status <= 5 && sku.status !== -1)
  }

  /**
   * @description: 单价(基本单位)和单价(销售单位)更新价格
   * @param {修改的选项的序号} index
   * @param {输入的值} value
   * @param {区分单价(基本单位)和单价(销售单位true -> 基本} isForSale
   */
  @action
  updatePrice(index, value, isForSale) {
    const { id, order_id, detail_id, sale_ratio } = this.skus.list[index]
    const data = isForSale
      ? {
          sku_id: id,
          order_id,
          detail_id,
          std_sale_price_forsale: value,
          sale_price: Big(value).times(sale_ratio).toFixed(2),
        }
      : {
          sku_id: id,
          order_id,
          detail_id,
          std_sale_price_forsale: Big(value).div(sale_ratio).toFixed(2),
          sale_price: value,
        }

    return Request('/station/order/detail/update')
      .data(data)
      .post()
      .then(
        action(() => {
          Tip.success(i18next.t('修改成功'))
          const newList = this.skus.list.slice()
          _.forEach(newList, (v) => {
            if (
              v.id === id &&
              v.order_id === order_id &&
              v.detail_id === detail_id
            ) {
              if (isForSale) {
                v.std_sale_price_forsale = value
                v.sale_price = Big(value).times(sale_ratio).toFixed(2)
              } else {
                v.sale_price = value
                v.std_sale_price_forsale = Big(value).div(sale_ratio).toFixed(2)
              }
            }
          })
        }),
      )
      .catch(() => false)
  }

  @action
  changeBatchListOrder(sortType) {
    this.skuBatch.list = this.skuBatch.list.sort((prevItem, curItem) => {
      const prevItemTotalQuantity = prevItem.orders
        .map((item) => item.quantity)
        .reduce((prev, cur) => prev + cur)
      const curItemTotalQuantity = curItem.orders
        .map((item) => item.quantity)
        .reduce((prev, cur) => prev + cur)
      if (sortType === undefined) {
        return curItemTotalQuantity - prevItemTotalQuantity
      } else if (sortType === 'desc') {
        return prevItemTotalQuantity - curItemTotalQuantity
      } else if (sortType === 'asc') {
        return 0
      }
    })
  }

  @action
  changeAllSelectedListOrder(aggregateSortType, needDetailId) {
    return Request('/station/order/order_sku_list', {
      timeout: 60000,
    })
      .data(
        Object.assign(this.searchData, {
          // 修改单价页面排序方式
          aggregate_sort_type: aggregateSortType,
          return_all: 'yes',
        }),
      )
      .get()
      .then((json) => {
        // 勾选全选时默认赋予每一个change_type为0
        _.forEach(json.data, (sku) => {
          sku.change_type = 0
        })
        // 处理一下detail_id
        let list = json.data
        if (needDetailId) {
          // 处理数据
          list = _.map(json.data, (item) => {
            const detail_ids = _.map(item.orders, (order) => order.detail_id)
            const orders = _.map(item.orders, (order) => ({
              ...order,
              sku_id: item.sku_id,
            }))
            return {
              ...item,
              detail_ids,
              orders,
            }
          })
        }
        this.skuBatch.list = this.skuBatchFilterLK(list)
      })
  }
}

export default new Store()
