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
  salemenuSelected: { name: i18next.t('全部报价单') },
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  inspect_status: '',
  orderType: initOrderType,
  customized_field: {},
  detail_customized_field: {},
  query_type: '2',
}

const initData = {
  finished: 0,
  total: 0,
  skus: [],
}

class Merchandise {
  // 按订单分拣搜索条件
  @observable merchandiseFilter = { ...initFilter }

  @observable searchFilter = {} // 点击搜索后，保存搜索时的数据，缺货设置有可能用到

  @observable merchandiseData = { ...initData }

  @observable salemenuList = []

  @observable selectedAllType = false // 0 所有， 1 当前页

  @observable selectedList = []

  @observable selectedTree = {}

  @action
  init() {
    this.merchandiseFilter = { ...initFilter }
    this.merchandiseData = { ...initData }
    this.searchFilter = {}
    this.resetSelected()
  }

  @action
  resetSelected() {
    this.selectedList = []
    this.selectedTree = {}
    this.selectedAllType = false
  }

  @computed
  get computedFilterParam() {
    const {
      time_config_id,
      start_date,
      end_date,
      search,
      salemenuSelected,
      categoryFilter,
      inspect_status,
      orderType,
      detail_customized_field,
      customized_field,
    } = this.merchandiseFilter
    const category_id_1 = JSON.stringify(
      _.map(categoryFilter.category1_ids.slice(), (v) => v.id),
    )
    const category_id_2 = JSON.stringify(
      _.map(categoryFilter.category2_ids.slice(), (v) => v.id),
    )
    const pinlei_id = JSON.stringify(
      _.map(categoryFilter.pinlei_ids.slice(), (v) => v.id),
    )
    const service_time = _.find(
      store.serviceTime.slice(),
      (s) => s._id === time_config_id,
    )

    const param = {
      time_config_id,
      category_id_1,
      category_id_2,
      pinlei_id,
      start_date: calculateCycleTime(start_date, service_time).begin,
      end_date: calculateCycleTime(end_date, service_time).end,
      detail_customized_field: _.keys(detail_customized_field).length
        ? JSON.stringify(detail_customized_field)
        : null,
      customized_field: _.keys(customized_field).length
        ? JSON.stringify(customized_field)
        : null,
    }
    if (salemenuSelected.id) {
      param.salemenu_id = salemenuSelected.id
    }
    if (inspect_status) {
      param.inspect_status = inspect_status
    }
    if (search) {
      param.search = search
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

  // 按商品分拣搜索
  @action
  fetchData(pagination = {}) {
    const params = {
      ...this.computedFilterParam,
      ...pagination,
    }
    return Request('/weight/weight_collect/sku/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          _.forEach(json.data.skus, (sku) => {
            _.forEach(sku.orders, (order) => {
              order.is_edit = false
              order.temp_std_real_quantity = order.std_real_quantity
              order.temp_real_quantity = order.real_quantity
              order._order_id =
                order.order_id +
                order.detail_id +
                (order.source_detail_id || '')
            })
            sku.children = sku.orders
          })
          this.merchandiseData = json.data
          this.resetSelected()
          this.searchFilter = { ...this.computedFilterParam } // 搜索成功后保存一下此时的搜索条件
          return json
        }),
      )
  }

  @action
  reset() {
    this.merchandiseFilter = {
      ...initFilter,
      time_config_id: store.serviceTime[0]._id,
      start_date: date,
      end_date: date,
    }
  }

  // 报价单列表
  @action
  getSaleMenuList() {
    return Request('/salemenu/sale/list')
      .get()
      .then(
        action((json) => {
          const salemenuList = json.data || []
          salemenuList.unshift({ name: i18next.t('全部报价单') })
          this.salemenuList = salemenuList
        }),
      )
  }

  // 设置出库数
  @action
  updateQuantity(skuIndex, orderIndex, value) {
    const skuList = this.merchandiseData.skus.slice()
    const sku = skuList[skuIndex]
    const order = sku.children[orderIndex]
    const param = {
      weights: JSON.stringify([
        {
          order_id: order.order_id,
          sku_id: sku.sku_id,
          detail_id: order.detail_id,
          weight: order.weighting_quantity,
          set_weight: value,
          source_order_id: order.source_order_id,
          source_detail_id: order.source_detail_id,
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
            sku.children[orderIndex] = Object.assign({}, order, json.data[0], {
              out_of_stock: 0,
            })
            this.merchandiseData.skus = skuList
            Tip.success(i18next.t('修改成功！'))
          } else if (json.code === 101) {
            sku.children[orderIndex] = Object.assign({}, order, json.data, {
              is_weight: json.data.has_weighted,
            })
            this.merchandiseData.skus = skuList
            Tip.success(
              i18next.t(
                '已在其他设备完成分拣，出库数更新为最新重量。请核对数量后再进行操作。',
              ),
            )
          }
          return json
        }),
      )
  }

  // 设置批量缺货
  @action
  batchOutStock(list = null) {
    const skuList = this.merchandiseData.skus.slice()
    const skuSelectedList = this.computedSelectedOrderList
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
      ? { ...this.searchFilter, op_way: 1 } // op_way 区分按点商品 1 还是按订单 2
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
            _.each(skuList, (sku) => {
              _.each(sku.children || [], (order) => {
                if (this.selectedAllType) {
                  Object.assign(order, {
                    out_of_stock: 1,
                    std_real_quantity: 0,
                  })
                } else {
                  _.find(
                    paramList,
                    (v) =>
                      v.order_id === order.order_id &&
                      v.sku_id === sku.sku_id &&
                      v.detail_id === order.detail_id &&
                      v.source_detail_id === order.source_detail_id,
                  ) &&
                    Object.assign(order, {
                      out_of_stock: 1,
                      std_real_quantity: 0,
                    })
                }
              })
            })
            this.merchandiseData.skus = skuList
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
    this.merchandiseFilter[field] = value
  }

  @action
  setFilterDate(begin, end) {
    this.merchandiseFilter.start_date = begin
    this.merchandiseFilter.end_date = end
  }

  @action
  toggleSelectedAllPage(bool) {
    this.selectedAllType = bool
  }

  @action
  setSelected(selected, selectedTree) {
    this.selectedList = selected
    this.selectedTree = selectedTree
    this.selectedAllType = false
  }

  @action
  updateOrder(skuIndex, orderIndex, key, value) {
    const list = this.merchandiseData.skus.slice()
    const orders = list[skuIndex].children.slice()
    const order = orders[orderIndex]
    order[key] = value
    list[skuIndex].children = orders
    this.merchandiseData.skus = list
  }

  @computed
  get computedSelectedOrderList() {
    const list = []
    _.each(this.merchandiseData.skus.slice(), (sku) => {
      const selectedList = this.selectedTree[sku.sku_id]
      _.each(sku.children || [], (order) => {
        if (
          _.find(
            selectedList || [],
            (v) =>
              v.indexOf(
                order.order_id +
                  order.detail_id +
                  (order.source_detail_id || ''),
              ) === 0,
          )
        ) {
          list.push(Object.assign({}, order, { sku_id: sku.sku_id }))
        }
      })
    })
    return list
  }

  setPagination(pagination) {
    this.pagination = pagination
  }
}

export default new Merchandise()
