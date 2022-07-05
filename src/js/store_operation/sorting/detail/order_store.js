import React from 'react'
import { i18next } from 'gm-i18n'
import { action, observable, computed } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import _ from 'lodash'

import store from '../store'
import { calculateCycleTime } from '../../../common/util'
import { Tip, Dialog } from '@gmfe/react'
import SellOutDialog from '../../../common/components/sell_out_dialog'
import { initOrderType } from '../../../common/enum'
import { getOrderTypeId } from '../../../common/deal_order_process'

const date = moment().startOf('day')

const initFilter = {
  time_config_id: '',
  start_date: date,
  end_date: date,
  search: '',
  routeSelected: { name: i18next.t('全部线路') },
  status: 0,
  carrier_id_and_driver_id: [],
  inspect_status: '',
  sort_status: '',
  print_status: '',
  customized_field: {},
  orderType: initOrderType, // 默认常规
  query_type: '2', //  O  int  日期查询类型 2-按运营周期，3-按收货日期
}

const initData = {
  finished: 0,
  total: 0,
  orders: [],
}

class Order {
  // 按订单分拣搜索条件
  @observable orderFilter = { ...initFilter }

  // eslint-disable-next-line gmfe/no-observable-empty-object
  @observable searchFilter = {} // 点击搜索后，保存搜索时的数据，缺货设置有可能用到

  @observable orderData = { ...initData }

  @observable routeList = [] // 线路信息

  @observable carrierDriverList = [] // 司机信息

  @observable selectedAllType = false

  // 订单选择列表
  @observable orderSelectedList = []

  @observable selectedList = []

  // eslint-disable-next-line gmfe/no-observable-empty-object
  @observable selectedTree = {}

  @action
  init() {
    this.orderFilter = { ...initFilter }
    this.searchFilter = {}
    this.orderData = { ...initData }
    this.selectedList = []
    this.selectedTree = {}
    this.selectedAllType = false
  }

  @action
  resetSelected() {
    this.selectedList = []
    this.selectedTree = {}
    this.selectedAllType = false
  }

  @action
  reset() {
    this.orderFilter = {
      ...initFilter,
      time_config_id: store.serviceTime[0]._id,
      start_date: date,
      end_date: date,
      orderType: initOrderType,
    }
  }

  @computed
  get computedFilterParam() {
    const {
      time_config_id,
      start_date,
      end_date,
      search,
      routeSelected,
      status,
      carrier_id_and_driver_id,
      inspect_status,
      sort_status,
      print_status,
      orderType,
      customized_field,
    } = this.orderFilter
    const service_time = _.find(
      store.serviceTime,
      (s) => s._id === time_config_id,
    )
    const param = {
      time_config_id,
      start_date: calculateCycleTime(start_date, service_time).begin,
      end_date: calculateCycleTime(end_date, service_time).end,
      need_details: 1,
      customized_field: _.keys(customized_field).length
        ? JSON.stringify(customized_field)
        : null,
    }
    if (routeSelected.id) {
      param.route_id = routeSelected.id
    }
    if (status !== 0) {
      param.status = status
    }
    if (inspect_status) {
      param.inspect_status = inspect_status
    }
    if (sort_status) {
      param.sort_status = sort_status
    }
    if (search) {
      param.search = search
    }
    if (carrier_id_and_driver_id.length > 0) {
      param.carrier_id = carrier_id_and_driver_id[0] || null
      param.driver_id = carrier_id_and_driver_id[1] || null
    }
    if (print_status) {
      param.print_status = print_status
    }

    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      return {
        ...param,
        order_process_type_id,
      }
    }

    return param
  }

  // 按订单分拣搜索
  @action
  fetchData(pagination = {}) {
    const params = {
      ...this.computedFilterParam,
      ...pagination,
    }
    return Request('/weight/weight_collect/order/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          _.forEach(json.data.orders, (order) => {
            const { id, client } = order
            _.forEach(order.details, (sku) => {
              sku.client = client
              sku.is_edit = false
              sku.temp_std_real_quantity = sku.std_real_quantity
              sku.temp_real_quantity = sku.real_quantity
              sku._sku_id =
                sku.sku_id + id + sku.detail_id + (sku.source_detail_id || '')
            })
            order.children = order.details
          })
          this.orderData = json.data
          this.resetSelected()
          this.searchFilter = { ...this.computedFilterParam } // 搜索成功后保存一下此时的搜索条件
          return json
        }),
      )
  }

  // 线路信息
  @action
  getRouteList() {
    return Request('/station/address_route/list')
      .data({ limit: 1000 })
      .get()
      .then(
        action((json) => {
          const routeList = json.data || []
          routeList.push({ id: -1, name: i18next.t('无线路') })
          routeList.unshift({ name: i18next.t('全部线路') })
          this.routeList = routeList
        }),
      )
  }

  // 司机信息
  @action
  getDriverList() {
    return Request('/station/task/distribute/get_drivers')
      .data()
      .get()
      .then(
        action((json) => {
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

          this.carrierDriverList = carrierDriverList
        }),
      )
  }

  // 设置出库数
  @action
  updateQuantity(orderIndex, skuIndex, value) {
    const orderList = this.orderData.orders.slice()
    const order = orderList[orderIndex]
    const sku = order.children[skuIndex]
    const param = {
      weights: JSON.stringify([
        {
          order_id: order.id,
          sku_id: sku.sku_id,
          detail_id: sku.detail_id,
          weight: sku.weighting_quantity,
          set_weight: value,
          source_order_id: sku.source_order_id,
          source_detail_id: sku.source_detail_id,
        },
      ]),
      need_res: 1,
    }
    return Request('/weight/sku/set_weight')
      .data(param)
      .code([101, 0])
      .post()
      .then(
        action((json) => {
          if (json.code === 0) {
            order.children[skuIndex] = Object.assign({}, sku, json.data[0], {
              out_of_stock: 0,
            })
            this.orderData.orders = orderList
            Tip.success(i18next.t('修改成功！'))
          } else if (json.code === 101) {
            order.children[skuIndex] = Object.assign({}, sku, json.data, {
              is_weight: json.data.has_weighted,
            })
            this.orderData.orders = orderList
            Tip.success(
              i18next.t(
                '已在其他设备完成分拣，出库数更新为最新重量。请核对数量后再进行操作。',
              ),
            )
          }
        }),
      )
  }

  // 设置批量缺货
  @action
  batchOutStock(list = null) {
    const orderList = this.orderData.orders.slice()
    const skuSelectedList = this.computedSelectedSkuList
    if (!this.selectedAllType && !list && skuSelectedList.length === 0) {
      Tip.info(i18next.t('请至少选择一个商品'))
      return Promise.reject(new Error('请至少选择一个商品'))
    }
    const paramList =
      list ||
      _.map(skuSelectedList, (s) => {
        return {
          order_id: s.order_id,
          sku_id: s.sku_id,
          detail_id: s.detail_id,
          source_order_id: s.source_order_id,
          source_detail_id: s.source_detail_id,
        }
      })

    const filterData = this.selectedAllType
      ? { ...this.searchFilter, op_way: 2 } // op_way 区分按点商品 1 还是按订单 2
      : { skus: JSON.stringify(paramList) }

    const tipText = this.selectedAllType
      ? i18next.t('所有')
      : paramList.length + i18next.t('个')
    return Dialog.confirm({
      children: <SellOutDialog />,
      title: i18next.t('批量修改缺货'),
      size: 'md',
    }).then(() => {
      return Request('/weight/batch_out_of_stock/update')
        .data(filterData)
        .post()
        .then((json) => {
          if (json.code === 0) {
            _.each(orderList, (order) => {
              _.each(order.children || [], (sku) => {
                if (this.selectedAllType) {
                  Object.assign(sku, { out_of_stock: 1, std_real_quantity: 0 })
                } else {
                  _.find(
                    paramList,
                    (v) =>
                      v.order_id === order.id &&
                      v.sku_id === sku.sku_id &&
                      v.detail_id === sku.detail_id &&
                      v.source_detail_id === sku.source_detail_id,
                  ) &&
                    Object.assign(sku, {
                      out_of_stock: 1,
                      std_real_quantity: 0,
                    })
                }
              })
            })
            this.orderData.orders = orderList
            this.resetSelected()
            Tip.success(
              i18next.t('KEY116', {
                VAR1: tipText,
              }) /* src:`成功修改${tipText}商品为缺货` => tpl:成功修改${VAR1}商品为缺货 */,
            )
            return json
          }
        })
    })
  }

  @action
  setFilter(field, value) {
    this.orderFilter[field] = value
  }

  @action
  setFilterDate(begin, end) {
    this.orderFilter.start_date = begin
    this.orderFilter.end_date = end
  }

  @action
  setSelected(selected, selectedTree) {
    this.selectedList = selected
    this.selectedTree = selectedTree
    this.isSelectAllPage = false
  }

  @action
  toggleSelectedAllPage(bool) {
    this.selectedAllType = bool
  }

  @action
  updateSku(orderIndex, skuIndex, key, value) {
    const list = this.orderData.orders.slice()
    const skus = list[orderIndex].children.slice()
    const sku = skus[skuIndex]
    sku[key] = value
    list[orderIndex].children = skus
    this.orderData.orders = list
  }

  @computed
  get computedSelectedSkuList() {
    const list = []
    _.each(this.orderData.orders.slice(), (order) => {
      const selectedList = this.selectedTree[order.id]
      _.each(order.children || [], (sku) => {
        if (
          _.find(
            selectedList || [],
            (v) =>
              v.indexOf(
                sku.sku_id +
                  order.id +
                  sku.detail_id +
                  (sku.source_detail_id || ''),
              ) === 0,
          )
        ) {
          list.push(Object.assign({}, sku, { order_id: order.id }))
        }
      })
    })
    return list
  }

  setPagination(pagination) {
    this.pagination = pagination
  }
}

export default new Order()
