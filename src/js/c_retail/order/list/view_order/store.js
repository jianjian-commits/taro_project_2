import { t } from 'gm-i18n'
import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { Tip } from '@gmfe/react'

import { searchDateTypes } from 'common/enum'
import { isEndOfDay } from 'common/util'
import { orderState } from 'common/filter'

// 开始时间
const beginDate = moment().startOf('day')
// !!!初始结束时间需要传当天的最后一刻，会展示为 24:00，实际传给后台为 第二天00:00
const endDate = moment().endOf('day')

const initFilter = {
  orderStatus: 0, // 订单状态
  orderInput: '',
  payStatus: 0, // 支付状态
  is_print: '', // 打印状态
  has_remark: '', // 订单备注
  receive_way: '', // 收货方式
  pickUpSelected: null, // 自提点
  shopListSelected: null, // 社区店
  searchType: 1, // 默认 按订单/商户 搜索
  in_query_search_text: '',
  sortType: '', // 排序
  begin: beginDate,
  end: endDate,
  dateType: searchDateTypes.ORDER.type
}

class Store {
  @observable orders = {
    filter: { ...initFilter },
    pickUpList: [], // 自提点
    in_query: false,
    total_sale_money_with_freight: 0, // 订单总金额
    total_sale_money_with_freight_dict: {}, // 订单汇总金额多币种
    pagination: {
      count: 0,
      offset: 0,
      limit: 10
    },
    loading: false,
    list: [],
    service_times: [],
    shopList: [] // 社区店
  }

  @observable selectedOrders = {
    selected: [],
    isAllSelected: false
  }

  doFirstRequest = _.noop()

  setDoFirstRequest(func) {
    // doFirstRequest有ManagePagination提供
    this.doFirstRequest = func
  }

  @computed
  get searchData() {
    const { filter } = this.orders
    const {
      has_remark,
      is_print,
      dateType,
      begin,
      end,
      orderStatus,
      orderInput,
      search_area,
      payStatus,
      is_inspect,
      pickUpSelected,
      shopListSelected,
      searchType,
      receive_way
    } = filter
    // !!! 针对选择的结束时间需要多做一步处理, 当选择 24:00 时需要转换成 第二天00:00 传给后台
    const start_date_new = isEndOfDay(begin)
    const end_date_new = isEndOfDay(end)

    let paramsTemp = null

    if (
      moment(begin)
        .add(3, 'M')
        .isBefore(end)
    ) {
      Tip.warning(t('时间范围不能超过三个月'))
      return null
    }
    if (dateType === searchDateTypes.ORDER.type) {
      paramsTemp = {
        start_date_new,
        end_date_new
      }
    } else if (dateType === searchDateTypes.RECEIVE.type) {
      paramsTemp = {
        receive_start_date_new: start_date_new,
        receive_end_date_new: end_date_new
      }
    }

    return {
      ...paramsTemp,
      query_type: dateType,
      search_text: orderInput,
      receive_way: receive_way || null,
      pick_up_st_id: (pickUpSelected && pickUpSelected.value) || null,
      distributor_id: (shopListSelected && shopListSelected.value) || null,
      has_remark: has_remark === '' ? null : has_remark,
      is_print: is_print === '' ? null : is_print,
      inspect_status: is_inspect === '' ? null : is_inspect,
      status: !orderStatus ? null : orderStatus, // 不要传空
      pay_status: !payStatus ? null : payStatus,
      search_area: search_area || null, // 不要传空
      search_type: searchType,
      client: 10 // !!! client = 10, 指定查询零售(toC)订单
    }
  }

  @action
  reset() {
    const { dateType } = this.orders.filter
    this.orders.filter = {
      ...initFilter,
      dateType
    }
  }

  @action
  filterChange(filter) {
    const filterObj = { ...this.orders.filter, ...filter }
    if (filter.dateType) {
      filter.begin = beginDate
      filter.end = beginDate
    }

    this.orders.filter = filterObj
  }

  @action
  getPickUpList() {
    return Request('/station/pick_up_station/list')
      .data({ limit: 0 })
      .get()
      .then(
        action(json => {
          this.orders.filter = {
            ...this.orders.filter
          }
          this.orders.pickUpList = _.map(json.data, item => {
            return { value: item.id, text: item.name }
          })
          return json
        })
      )
  }

  @action
  getShopList() {
    return Request('/community/distributor_valid/list')
      .data()
      .get()
      .then(
        action(json => {
          this.orders.filter = {
            ...this.orders.filter
          }
          this.orders.shopList = _.map(json.data, item => {
            return { value: item.id, text: item.community_name }
          })
        })
      )
  }

  @action
  orderSelect(selected) {
    const list = [...this.orders.list]
    let isAllSelected = false
    const filterList = _.filter(list, order => {
      // 去掉订单不可选的状态
      return order.status < 15
    })
    if (filterList.length === selected.length) {
      isAllSelected = true
    }
    this.selectedOrders = {
      selected,
      isAllSelected
    }
  }

  @action.bound
  orderListSearch(searchData, page) {
    if (!searchData) return
    if (page) {
      searchData = Object.assign(searchData, page)
    }
    searchData.is_retail_interface = 1

    this.orders.loading = true

    return Request('/station/orders')
      .data(searchData)
      .get()
      .then(json => {
        const filter = { ...this.orders.filter }
        if (json.data.in_query) {
          filter.begin = beginDate
          filter.end = beginDate
          filter.in_query_search_text = searchData.search_text
        } else {
          filter.in_query_search_text = ''
        }
        this.orders = Object.assign({}, this.orders, json.data, {
          in_query: json.data.in_query,
          loading: false,
          filter
        })
        this.orderSelect([])
        return {
          data: json.data.list,
          pagination: json.data.pagination
        }
      })
  }

  @action
  orderSingleStatusChange(index, status) {
    const list = [...this.orders.list]
    const order = list[index]
    order.status_tmp = status
    this.orders.list = list
  }

  @action.bound
  orderStatusUpdate(status, ids, remark = undefined) {
    return Request('/station/order/set_status')
      .data({
        order_ids: ids.join(','),
        client: 10,
        is_retail_interface: 1,
        status,
        batch_remark: remark
      })
      .post()
      .then(json => {
        const list = [...this.orders.list]

        _.each(ids, order_id => {
          _.every(list, order => {
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
          t('KEY76', {
            VAR1: json.data.count,
            VAR2: orderState(status)
          }) /* src:`修改完成,修改${json.data.count}个订单状态为${orderState(status)}` => tpl:修改完成,修改${VAR1}个订单状态为${VAR2} */
        )
        return json
      })
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
    batch_remark = undefined
  ) {
    const { filter } = this.orders
    const query = {
      from_status,
      search_text,
      count,
      to_status,
      batch_remark,
      query_type: filter.dateType,
      client: 10, // 没有传id的，都要加上c端查询订单字段
      is_retail_interface: 1
    }
    const begin = isEndOfDay(start_date_new)
    const end = isEndOfDay(end_date_new)

    if (filter.dateType === searchDateTypes.ORDER.type) {
      Object.assign(query, {
        start_date_new: begin,
        end_date_new: end
      })
    } else if (filter.dateType === searchDateTypes.RECEIVE.type) {
      Object.assign(query, {
        receive_start_date_new: begin,
        receive_end_date_new: end
      })
    }

    return Request('/station/order/update/status/preconfig', { timeout: 60000 })
      .data(query)
      .post()
      .then(json => {
        Tip.success(
          t('KEY88', {
            VAR1: json.data.success,
            VAR2: orderState(to_status)
          }) /* src:`更新完成,共${json.data.success}个订单状态更新为${orderState(to_status)}` => tpl:更新完成,共${VAR1}个订单状态更新为${VAR2} */
        )

        if (json.data.failed > 0) {
          Tip.warning(
            t('KEY89', {
              VAR1: json.data.failed
            }) /* src:`更新失败,共${json.data.failed}个订单状态更新失败,请稍后再次尝试更新` => tpl:更新失败,共${VAR1}个订单状态更新失败,请稍后再次尝试更新 */
          )
        }
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
  orderDelete(order_id, index, isOldOrder = false, remark) {
    return Request(
      isOldOrder ? '/station/order/delete_old' : '/station/order/delete'
    )
      .data({ order_id, remark, is_retail_interface: 1 })
      .post()
      .then(() => {
        const list = [...this.orders.list]
        list.splice(index, 1)

        this.orders.list = list
        this.orders.pagination = Object.assign({}, this.orders.pagination, {
          count: --this.orders.pagination.count
        })
      })
  }

  @action
  orderListExport(data) {
    return Request('/station/sales_analysis/orderdetail_v2')
      .data(data)
      .get()
  }

  @action
  fetchStationServiceTime() {
    return Request('/service_time/list')
      .get()
      .then(json => {
        const serviceTimes = json.data
        // service_type: 1 - toB 2 - toC, 纯C订单只需要判断纯C的运营时间
        this.orders.service_times = _.filter(
          serviceTimes,
          service_time => service_time.service_type === 2
        )
      })
  }
}

export default new Store()
