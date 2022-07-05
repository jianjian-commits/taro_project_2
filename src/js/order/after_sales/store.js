import { t } from 'gm-i18n'
import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import Big from 'big.js'
import { System } from '../../common/service'
import { Tip } from '@gmfe/react'
import { AFTER_SALES_TYPE, isSelectDisable } from './util'

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
  version: '',
}

const initAbnormal = {
  exception_amount: null,
}

const initRefund = {
  request_amount_forsale: null,
}

const initAfterSale = Object.assign(
  { exception_reason_text: '' },
  { ...initAbnormal },
  { ...initRefund },
)

class AfterSalesStore {
  @observable orderDetail = Object.assign({}, initOrderDetail)
  @observable skuList = []
  @observable reasonList = [] // 异常原因，使用新接口，不从订单数据中取
  @observable refundData = new Map() // 退货
  @observable abnormalData = new Map() // 异常
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable expanded = {}

  @action
  setExpanded(expanded) {
    this.expanded = expanded
  }

  getAdapterData(data) {
    const { exception_new, refund_new, details } = data
    const list = []
    const abnormal = new Map()
    const refund = new Map()

    _.each(details, (detail, index) => {
      const result = {
        index,
        _idIndex: detail.sku_id + '_' + detail.detail_id, // 对应售后数据的key字段
        _std_real_quantity: detail.clean_food
          ? +Big(detail.std_real_quantity || 0)
              .div(detail.sale_ratio)
              .toFixed(2)
          : detail.std_real_quantity,
        ...detail,
      }

      // 处理异常表格数据，无数据默认为空数组
      if (exception_new && exception_new[result._idIndex]) {
        abnormal.set(result._idIndex, exception_new[result._idIndex])
      } else {
        abnormal.set(result._idIndex, [])
      }

      // 处理退货表格数据，无数据默认为空数组
      if (refund_new && refund_new[result._idIndex]) {
        refund.set(result._idIndex, refund_new[result._idIndex])
      } else {
        refund.set(result._idIndex, [])
      }

      let after_sales_type = 0
      let totalBillingNumber = 0 // 总记账数
      let totalRefundCount = 0 // 总退货数
      let totalAbnormalCount = 0 // 总异常数
      /**
       * ！！！增加多sku功能后，sku的唯一标识都通过detail_id区分，由于售后接口返回数据原本就有detail_id，有冲突
       * 售后数据返回数据中以order_detail_id来区分表示，原来的保持不变
       */
      // 处理汇总数据
      if (exception_new && exception_new[result._idIndex]) {
        after_sales_type = 1

        _.each(abnormal.get(result._idIndex), (item) => {
          // 净菜需要销售单位，这里是基本单位，需要转成销售单位(记帐数)
          item.exception_amount = detail.clean_food
            ? +Big(item.exception_amount || detail.std_real_quantity || 0)
                .div(detail.sale_ratio)
                .toFixed(2)
            : +Big(item.exception_amount || 0).toFixed(2)

          totalAbnormalCount = +Big(item.exception_amount).plus(
            totalAbnormalCount,
          )
        })
      }

      totalBillingNumber = +Big(result._std_real_quantity)
        .plus(totalAbnormalCount)
        .toFixed(2)

      if (refund_new && refund_new[result._idIndex]?.length > 0) {
        after_sales_type = 2

        _.each(refund.get(result._idIndex), (item) => {
          // 净菜需要销售单位，这里是基本单位，需要转成销售单位(退货数)
          item.request_amount_forsale = detail.clean_food
            ? +Big(
                item.request_amount_forsale ||
                  detail.request_amount_forsale ||
                  0,
              )
                .div(detail.sale_ratio)
                .toFixed(2)
            : +Big(item.request_amount_forsale || 0).toFixed(2)

          totalRefundCount = +Big(item.request_amount_forsale)
            .plus(totalRefundCount)
            .toFixed(2)
        })
      }

      let isTotalDisabled = false
      // 只要存在一条退货数据state>=2即不可编辑，因此需要处理总的disabled
      if (refund_new && refund_new[result._idIndex]) {
        _.each(refund_new[result._idIndex], (item) => {
          if (isSelectDisable(item, 'refund')) {
            isTotalDisabled = true
          }
        })
      }

      list.push({
        ...result,
        after_sales_type,
        totalBillingNumber,
        totalAbnormalCount,
        totalRefundCount,
        isTotalDisabled,
      })
    })

    return { list, abnormal, refund }
  }

  getSubmitParams() {
    const skuList = this.skuList.slice()
    const { _id, station_id, version } = this.orderDetail
    const exception_new = {}
    const refund_new = {}
    const { refund, abnormal } = this.getAbnormalAndRefundData()

    _.forEach(skuList, (detail) => {
      const {
        after_sales_type,
        id,
        clean_food,
        sale_ratio,
        detail_id,
        _idIndex,
      } = detail
      // 异常数据
      if (after_sales_type === 1) {
        const exceptionList = []
        _.each(abnormal.get(_idIndex), (abnormalItem) => {
          const { exception_amount, exception_reason_text } = abnormalItem
          const exceptionDetail = {
            exception_amount: clean_food
              ? Big(exception_amount).times(sale_ratio).toFixed(2)
              : parseFloat(exception_amount, 10), // 净菜因为是销售单位的数据，因此提交的时候要转成基本单位提交
            sku_id: id,
            exception_reason_text,
            exception_info: 1,
            solution: 2, // 某个特殊值（货品减免问题）
            detail_id,
            id: abnormalItem.id || undefined,
          }

          exceptionList.push(exceptionDetail)
        })
        exception_new[_idIndex] = exceptionList
      } else if (after_sales_type === 2) {
        // 退货数据
        const refundList = []

        _.each(refund.get(_idIndex), (refundItem) => {
          const {
            request_amount_forsale,
            id,
            exception_reason_text,
          } = refundItem

          const refundDetail = {
            request_amount_forsale: clean_food
              ? Big(request_amount_forsale).times(sale_ratio).toFixed(2) // 净菜的话因为是销售单位的数据，因此提交的时候要转成基本单位提交
              : parseFloat(request_amount_forsale, 10),
            sku_id: id,
            station_store_id: station_id,
            exception_info: 1,
            detail_id,
            exception_reason_text,
            id: id || undefined,
          }

          refundList.push(refundDetail)
        })

        refund_new[_idIndex] = refundList
      }
    })
    return {
      id: _id,
      exception_new: JSON.stringify(exception_new),
      refund_new: JSON.stringify(refund_new),
      is_retail_interface: System.isC() ? 1 : null,
      is_duplicate_sku: 1,
      version,
    }
  }

  @action
  get(id) {
    return Request('/station/order/edit')
      .data({ id, is_duplicate_sku: 1 })
      .get()
      .then((json) => {
        this.orderDetail = json.data
        const { abnormal, refund, list } = this.getAdapterData(json.data)
        this.skuList = list
        this.abnormalData = abnormal // 异常数据
        this.refundData = refund // 退货数据

        return json
      })
  }

  @action
  clear() {
    this.skuList = []
    this.orderDetail = Object.assign({}, initOrderDetail)
    this.refundData = new Map()
    this.abnormalData = new Map()
    this.expanded = {}
  }

  // 获取合理的待提交数据,过滤空行，保留实际选择的异常或者退货数据
  @action
  getAbnormalAndRefundData() {
    const refund = new Map()
    const abnormal = new Map()

    _.each(this.skuList, (item) => {
      const { after_sales_type, _idIndex } = item

      // 异常
      if (after_sales_type === 1) {
        const data = []

        _.each(this.abnormalData.get(_idIndex), (abn) => {
          const { exception_reason_text, exception_amount } = abn
          const _exception_reason_text = _.trim(exception_reason_text)
          // 有填数据则为有效数据
          if (_exception_reason_text !== '' || !_.isNil(exception_amount)) {
            data.push({ ...abn, exception_reason_text: _exception_reason_text })
          }
        })

        abnormal.set(_idIndex, data)
      }
      // 退货
      if (after_sales_type === 2) {
        const data = []
        _.each(this.refundData.get(_idIndex), (ref) => {
          const { exception_reason_text, request_amount_forsale } = ref
          const _exception_reason_text = _.trim(exception_reason_text)

          // 有填数据则为有效数据
          if (
            _exception_reason_text !== '' ||
            !_.isNil(request_amount_forsale)
          ) {
            data.push({ ...ref, exception_reason_text: _exception_reason_text })
          }
        })
        refund.set(_idIndex, data)
      }
    })

    return { refund, abnormal }
  }

  checkAfterSaleAmount() {
    const { abnormal, refund } = this.getAbnormalAndRefundData() // 获取选择了异常或者退货的数据
    let canSubmit = true

    for (const value of abnormal.values()) {
      _.each(value, (item) => {
        const { exception_reason_text, exception_amount } = item

        // 有填数据则为有效数据
        if (_.trim(exception_reason_text) === '' || _.isNil(exception_amount)) {
          canSubmit = false
        }
      })

      if (value.length === 0) {
        canSubmit = false
      }
    }

    if (!canSubmit) {
      Tip.warning(t('记账数或售后原因不能为空!'))
      return canSubmit
    }

    for (const value of refund.values()) {
      _.each(value, (item) => {
        const { exception_reason_text, request_amount_forsale } = item

        // 有填数据则为有效数据
        if (
          _.trim(exception_reason_text) === '' ||
          _.isNil(request_amount_forsale)
        ) {
          canSubmit = false
        }
      })
      if (value.length === 0) {
        canSubmit = false
      }
    }

    if (!canSubmit) {
      Tip.warning(t('退货数或售后原因不能为空!'))
      return canSubmit
    }

    return canSubmit
  }

  @action
  checkReturnCoupon() {
    const {
      id,
      exception_new,
      refund_new,
      is_duplicate_sku,
    } = this.getSubmitParams()
    return Request('/coupon/check_return')
      .data({ order_id: id, exception_new, refund_new, is_duplicate_sku })
      .post()
  }

  @action
  save() {
    const params = this.getSubmitParams()
    if (!params) {
      return
    }
    return Request('/station/order/exception')
      .data(params)
      .post()
      .then((json) => {
        return json.data
      })
  }

  @action
  selectChange(index, name, value) {
    const details = this.skuList
    const detail = details[index]

    if (name === 'after_sales_type' && value !== 0) {
      const afterSalesDetail = this[AFTER_SALES_TYPE[value].dataName].get(
        this.skuList[index]._idIndex,
      )

      const defaultReasonText = this.reasonList[0]?.text || '' // 默认取第一条
      // 空数据的情况给默认值
      if (value === 1 && afterSalesDetail.length === 0) {
        this.abnormalData.set(this.skuList[index]._idIndex, [
          {
            ...initAfterSale,
            exception_reason_text: defaultReasonText,
            exception_amount: 0,
          },
        ])

        this.skuList[index].totalAbnormalCount = 0
        // 计算记账数
        this.skuList[index].totalBillingNumber = detail._std_real_quantity // 异常,没有数据时也要对净菜特殊处理成销售单位的值
      }

      if (value === 2 && afterSalesDetail.length === 0) {
        this.refundData.set(this.skuList[index]._idIndex, [
          {
            ...initAfterSale,
            exception_reason_text: defaultReasonText,
            request_amount_forsale: 0,
          },
        ])

        // 计算总退货数
        this.skuList[index].totalRefundCount = 0
      }
    }

    this.skuList[index][name] = value
  }

  @action
  changeDetailItem(index, name, value) {
    this.skuList[index][name] = value
  }

  @action
  addAfterSales(dataName, key) {
    const defaultReasonText = this.reasonList[0]?.text || '' // 默认取第一条
    this[dataName]
      .get(key)
      .push({ ...initAfterSale, exception_reason_text: defaultReasonText })
  }

  @action
  delAfterSales(dataName, key, index, parentIndex) {
    if (dataName === 'abnormalData') {
      const num = this[dataName].get(key)[index].exception_amount || 0
      // 计算总异常数
      this.skuList[parentIndex].totalAbnormalCount = +Big(
        this.skuList[parentIndex].totalAbnormalCount,
      ).minus(num)

      // 计算总记账数
      this.skuList[parentIndex].totalBillingNumber = +Big(
        this.skuList[parentIndex]._std_real_quantity,
      ).plus(this.skuList[parentIndex].totalAbnormalCount)
    }
    if (dataName === 'refundData') {
      const num = this[dataName].get(key)[index].exception_amount || 0
      // 计算总退货数
      this.skuList[parentIndex].totalRefundCount = +Big(
        this.skuList[parentIndex].totalRefundCount,
      )
        .minus(num)
        .toFixed(2)
    }
    this[dataName].get(key).splice(index, 1)
  }

  /**
   *
   * @param {string} type 售后类型
   * @param {string} key sku标识，用于找到列表数据
   * @param {number} index 列表下表
   * @param {string} keyName 待改变值的key name
   * @param {any} value 待改变的值
   */
  @action
  changeSubValue(type, key, index, keyName, value) {
    if (type === 'abnormal') {
      this.abnormalData.get(key)[index][keyName] = value
    } else if (type === 'refund') {
      this.refundData.get(key)[index][keyName] = value
    }
  }

  @action
  fetchReason() {
    return Request('/station/order/exception_base_info')
      .get()
      .then((json) => {
        runInAction(() => {
          this.reasonList = _.map(json.data.sku_recent_exceptions, (item) => {
            return {
              text: item,
            }
          })
        })

        return json
      })
  }
}

export default new AfterSalesStore()
