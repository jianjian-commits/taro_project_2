import { t } from 'gm-i18n'
import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'

import { isEndOfDay } from 'common/util'
import { Tip } from '@gmfe/react'
import { System } from '../../../common/service'

const beginDate = moment().startOf('day')
const endDate = moment().endOf('day')

const initFilter = {
  begin: beginDate,
  end: endDate,
  refundStatus: -1,
  search_text: '',
}

const initOrderDetail = {
  _id: '',
  freeze: '',
  remark: '',
  date_time: '',
  last_op_user: '',
  last_op_time: '',
  customer: {},
  details: [],
  time_config_info: {},
  refunds: [],
  abnormals: [],
  exception_reasons: {},
  has_refund_money_abnormal_sku_ids: [], // 保存已经发起异常处理退款的商品
  version: '',
}

const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}

class Store {
  @observable loading = false

  // 退款搜索条件
  @observable filter = { ...initFilter }

  // 退款订单列表
  @observable refundOrdersList = []

  // 退款列表分页
  @observable pagination = { ...initPagination }

  // 退款母表选择列表
  @observable selectedRefundList = []

  // 商品售后列表
  @observable skusList = []

  // 订单商品售后详情
  @observable orderDetail = { ...initOrderDetail }

  // 交易流水
  @observable tradeList = []

  // 获取列表页数据页码抛出来的方法
  @observable apiDoFirstRequest = _.noop

  /** 商品售后处理 */
  getskuList(data) {
    const { abnormals, details, exception_reason } = data
    return _.map(details, (detail, index) => {
      const result = {
        index,
        ...detail,
      }
      let after_sales_type = 0
      let type_id
      let request_amount_forsale
      let final_amount_forsale
      // 原始退货/异常数据
      result.abnormal =
        _.find(abnormals, (abnormal) => abnormal.detail_id === detail.id) ||
        null

      if (result.abnormal) {
        after_sales_type = 1
        type_id = result.abnormal.type_id
        final_amount_forsale = Big(
          result.abnormal.final_amount_forsale || 0,
        ).toFixed(2)
      }

      // 净菜需要销售单位，这里是基本单位，需要转成销售单位(记帐数，退货数)
      if (detail.clean_food) {
        request_amount_forsale = Big(
          request_amount_forsale || detail.request_amount_forsale || 0,
        )
          .div(detail.sale_ratio)
          .toFixed(2)

        final_amount_forsale = Big(
          final_amount_forsale || detail.std_real_quantity || 0,
        )
          .div(detail.sale_ratio)
          .toFixed(2)
      }

      const exception_reasons = _.map(exception_reason, (v, key) => ({
        text: v,
        value: _.toNumber(key),
      }))

      return {
        ...result,
        after_sales_type,
        type_id,
        request_amount_forsale,
        final_amount_forsale,
        exception_reasons,
      }
    })
  }

  @action.bound
  get(id) {
    return Request('/station/order/edit')
      .data({ id, client: 10, is_retail_interface: 1 }) // client=10 表示toc订单
      .get()
      .then((json) => {
        runInAction(() => {
          this.orderDetail = json.data
          this.skusList = this.getskuList(json.data)
        })
      })
  }

  @action
  skusSelectChange(index, name, value) {
    const details = this.skusList
    const detail = details[index]
    const result = parseInt(+value, 10)

    if (name === 'after_sales_type') {
      if (value === 1 && !detail.final_amount_forsale) {
        detail.final_amount_forsale = detail.clean_food
          ? Big(detail.std_real_quantity || 0)
              .div(detail.sale_ratio)
              .toFixed(2)
          : detail.std_real_quantity // 异常,没有数据时也要对净菜特殊处理成销售单位的值
      }

      detail.type_id = detail.type_id || 1
    }
    if (_.isNumber(result)) {
      detail[name] = result
    }
  }

  @action
  skusInputChange(index, name, value) {
    const details = this.skusList
    const detail = details[index]
    detail[name] = parseFloat(value) > 99999 ? 99999 : value
  }

  getSubmitParams() {
    const skuList = this.skusList.slice()
    const { _id, version } = this.orderDetail
    const exceptionList = []
    const refundList = []

    _.forEach(skuList, (detail) => {
      const {
        id,
        type_id,
        final_amount_forsale,
        clean_food,
        sale_ratio,
        after_sales_type,
        abnormal,
      } = detail

      // 本次做异常的数据 + 已经做了异常的数据需要传给后台
      const exceptionDetail = {
        final_amount_forsale: clean_food
          ? Big(final_amount_forsale).times(sale_ratio).toFixed(2)
          : parseFloat(final_amount_forsale, 10), // 净菜因为是销售单位的数据，因此提交的时候要转成基本单位提交
        sku_id: id,
        exception_reason: type_id,
        exception_info: 1,
        solution: 2,
      }

      // 做了异常
      if (abnormal) exceptionDetail.id = abnormal.id
      if (after_sales_type) {
        exceptionList.push(exceptionDetail)
      }
    })
    return {
      id: _id,
      exception: JSON.stringify(exceptionList),
      refund: JSON.stringify(refundList),
      is_retail_interface: System.isC() ? 1 : null,
      version,
    }
  }

  checkAfterSaleAmount() {
    const skuList = this.skusList.slice()
    const final_amount = _.filter(
      skuList,
      (e) => e.final_amount_forsale === '' && e.after_sales_type === 1,
    )
    if (final_amount.length) {
      Tip.warning(t('记账数不能为空!'))
      return false
    }

    return true
  }

  @action.bound
  save() {
    const params = this.getSubmitParams()
    return Request('/station/order/exception')
      .data(params)
      .post()
      .then((json) => {
        return json.data
      })
  }
  /** 订单商品售后 */

  /** 退款售后处理 */
  @action
  setDoApiDoFirstSearchFunc(func) {
    this.apiDoFirstRequest = func
  }

  @action
  filterChange(obj) {
    this.filter = {
      ...this.filter,
      ...obj,
    }
  }

  @action
  getSearchFilter(pagination) {
    const { begin, end, refundStatus, search_text } = this.filter
    const status = refundStatus === -1 ? {} : { refund_status: refundStatus }

    const start_time = isEndOfDay(begin)
    const end_time = isEndOfDay(end)

    return {
      start_time,
      end_time,
      search_text,
      ...status,
      ...pagination,
    }
  }

  @action.bound
  getRefundOrdersList(pagination = {}) {
    this.loading = true
    const postData = this.getSearchFilter(pagination)

    return Request('/station/cshop/after_sale/list')
      .data(postData)
      .post()
      .then((json) => {
        runInAction(() => {
          // 加上各个订单的选择商品列表
          const list = _.map(json.data, (item) => ({
            ...item,
            selected: [],
          }))
          this.refundOrdersList = list
          this.pagination = json.pagination
          this.loading = false
        })
        return json
      })
  }

  @action
  setSelected(type, selected, index = null) {
    const data = [...this.refundOrdersList]
    const originOrderSelected = [...this.selectedRefundList]

    // 母表
    if (type === 'order') {
      // 判断是勾选 or 取消，子表需要做相应处理
      let isSelected = false
      if (selected.length > originOrderSelected.length) {
        isSelected = true
      }

      const order_id = _.xor(selected, originOrderSelected)
      let skus_ids = []
      // 处理 母 / 子 selected情况
      _.forEach(order_id, (order) => {
        const order_index = _.findIndex(data, (item) => item.order_id === order)
        if (isSelected) {
          // 母表勾选, 子表需要全勾选
          skus_ids = _.map(data[order_index].details, (sku) => sku.sku_id)
        }
        this.refundOrdersList[order_index].selected = skus_ids
      })

      this.selectedRefundList = selected
      return
    }

    // 子表勾选, 选择之后为全选
    if (selected.length === data[index].details.length) {
      this.selectedRefundList.push(data[index].order_id)
    } else {
      // 取消全选
      this.selectedRefundList = _.filter(
        originOrderSelected,
        (order) => order !== data[index].order_id,
      )
    }
    this.refundOrdersList[index].selected = selected
  }

  // 清空所有选择
  @action
  resetSelected() {
    _.forEach(this.refundOrdersList.slice(), (order) => {
      order.selected = []
    })
    this.selectedRefundList = []
  }

  // 退款操作
  @action.bound
  dealSkuRefund(data) {
    return Request('/station/cshop/after_sale/update')
      .data(data)
      .post()
      .then((json) => {
        // todo 响应处理
        if (!json.code) {
          Tip.info(t('成功发起退款处理，请耐心等待'))
        }
      })
  }

  // 获取交易流水信息
  @action.bound
  getTradeFlow(id) {
    return Request('/station/cshop/after_sale/order/flow')
      .data({ order_id: id })
      .get()
      .then((json) => {
        runInAction(() => {
          this.tradeList = json.data
        })
      })
  }
}

export default new Store()
