import { i18next } from 'gm-i18n'
import { action, runInAction, extendObservable } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'
import { Tip } from '@gmfe/react'

import { getOrderPrice } from './util'
import {
  fixNowMoment,
  getServiceTime,
  getFirstAvailConfigTime,
  getReceiveTime,
  getOrderMsg,
  dialogMsgs,
  isOrderTimeValid,
  dealCombineGoodsData,
  deleteCombineGoods,
  getPostSkus,
  filterSkusCommon,
  getCombineGoodsMap,
  asyncSalePrice,
  asyncQuantityAndFakeQuantity,
  asyncSkuInfo,
  asyncSpuRemarkAndCustomize,
  setSalePriceIfCombineGoods,
  asyncSalePriceInOrder,
  getRoundingText,
  hasUnReceiveTimes,
} from '../util'
import { convertDay2Bit } from '../../common/util'
import globalStore from 'stores/global'
import { getOrderTypeList } from 'common/deal_order_process'

const initialState = {
  loading: true,
  task_id: '',
  file_name: '',
  details: [],
  serviceTime: null,
  orderTypeOptions: [],
}

function smsNotify(status) {
  if (status === 2) {
    Tip.warning(i18next.t('短信余额不足，消息未发送，请及时充值！'))
  }
}

class Store {
  constructor() {
    extendObservable(this, initialState)
  }

  @action
  reset() {
    this.loading = true
    this.task_id = ''
    this.file_name = ''
    this.details = []
    this.serviceTime = null
    this.orderTypeOptions = []
  }

  @action
  fixReceiveTime() {
    const details = this.details.slice() || []
    _.forEach(details, (detail) => {
      const serviceTime = detail.time_config_info
      if (serviceTime && serviceTime.type === 2) {
        const { weekdays, customer_weekdays } = serviceTime.receive_time_limit
        const filter = weekdays & customer_weekdays
        if (
          filter !== 127 &&
          !(convertDay2Bit(detail.flagStart, moment()) & filter)
        ) {
          const configTime = getFirstAvailConfigTime(serviceTime, filter)
          detail.flagStart = configTime.flagStart
          detail.flagEnd = configTime.flagEnd
        }
      }
    })
    this.details = details
  }

  @action.bound
  getFreights() {
    const address_ids = _.map(
      this.details.slice(),
      (item) => item.address_id,
    ).filter((_) => _)
    return Request('/station/order/freight')
      .data({ address_ids: JSON.stringify(address_ids) })
      .get()
      .then((json) => {
        _.forEach(this.details, (order) => {
          const freight = json.data[order.address_id]
          order.freight = freight
          order.total_price = getOrderPrice(
            order.skus,
            freight,
            order.receive_way,
          )
        })
      })
  }

  @action.bound
  getErrorList(task_id) {
    this.loading = true
    return Request('/station/order/batch/result')
      .data({ task_id })
      .get()
      .then((json) => {
        const allOrderTypeValues = this.getAllOrderTypeValues()
        this.serviceTime = json.data.time_config
        this.details = _.map(json.data.details, (detail, index) => {
          const { receive_time_limit, order_process_type_id } = detail
          let time_config_info = json.data.time_config
          if (receive_time_limit) {
            time_config_info = {
              ...time_config_info,
              receive_time_limit,
            }
          }
          return {
            ...detail,
            index: index + 1,
            timeStart: moment(detail.timeStart, 'HH:mm'),
            timeEnd: moment(detail.timeEnd, 'HH:mm'),
            time_config_info,
            total_price: getOrderPrice(
              detail.skus,
              detail.freight,
              detail.receive_way,
            ),
            order_process_type_id: allOrderTypeValues.includes(
              order_process_type_id,
            )
              ? order_process_type_id
              : undefined,
          }
        })
        this.file_name = json.data.file_name
        this.task_id = json.data.task_id
        this.loading = false
        this.getFreights()
        return json.data.details
      })
  }

  @action
  upload(params, config) {
    this.loading = true
    return Request('/station/order/batch/template/upload')
      .data({ ...params, search_combine_goods: 1 })
      .post()
      .then((json) => {
        runInAction(() => {
          const allOrderTypeValues = this.getAllOrderTypeValues()
          const {
            serviceTime: time_config_info,
            receiveTime: { flagStartMin, flagEndMax },
          } = config
          const { task_id, details, file_name } = json.data
          const { e_span_time } = time_config_info.order_time_limit
          const start_order = time_config_info.order_time_limit.start
          let S_SPAN_TIME = 0 // 起始时间当天
          // 如果当前时间小于下单的开始和结束时间，则为上个周期
          if (
            e_span_time === 1 &&
            moment().isBefore(moment(start_order, 'HH:mm'))
          ) {
            time_config_info.order_time_limit.s_span_time = --S_SPAN_TIME
            time_config_info.order_time_limit.e_span_time--
          }
          const {
            start,
            end,
            s_span_time,
            receiveTimeSpan,
          } = time_config_info.receive_time_limit
          const nowMoment = fixNowMoment(start, receiveTimeSpan)
          let timeStartConfig = moment(start, 'HH:mm')
          const timeEndConfig = moment(end, 'HH:mm')
          if (
            timeStartConfig < nowMoment &&
            s_span_time === 0 &&
            flagStartMin === 0
          ) {
            timeStartConfig = nowMoment
          }
          this.loading = false
          this.task_id = task_id
          this.file_name = file_name
          this.serviceTime = time_config_info
          this.details = _.map(details, (detail, index) => {
            const { code, skus, order_process_type_id } = detail
            if (code > 0) {
              return { ...detail, index: index + 1 }
            }
            const receiveTimeLimit =
              detail.receive_time_limit || time_config_info.receive_time_limit
            const receiveTime = getServiceTime(
              detail.receive_time || {},
              {
                timeStart: timeStartConfig,
                timeEnd: timeEndConfig,
                flagStart: flagStartMin,
                flagEnd: flagEndMax,
              },
              {
                ...receiveTimeLimit,
                s_span_time: flagStartMin,
                e_span_time: flagEndMax,
              },
              time_config_info.type,
            )
            let skuList = []

            _.each(skus, (sku) => {
              if (sku.code > 0) {
                skuList.push(sku)
              } else {
                const data = sku.sku_data.shift()
                data.detail_customized_field = sku.detail_customized_field || {}
                const { sale_price, ...rest } = sku
                if (data.is_combine_goods) {
                  const goods = dealCombineGoodsData(data, sku.quantity)
                  setSalePriceIfCombineGoods(goods)
                  skuList = skuList.concat(goods)
                } else {
                  skuList.push({
                    default_sale_unit_name: data.sale_unit_name,
                    ...data,
                    ...rest,
                    sale_price: _.isNil(sale_price)
                      ? data.sale_price
                      : sale_price,
                  })
                }
              }
            })
            return {
              ...detail,
              ...receiveTime,
              index: index + 1,
              skus: skuList,
              time_config_info: Object.assign({}, time_config_info, {
                receive_time_limit: receiveTimeLimit,
              }),
              total_price: getOrderPrice(
                skuList,
                detail.freight,
                detail.receive_way,
              ),
              order_process_type_id: allOrderTypeValues.includes(
                order_process_type_id,
              )
                ? order_process_type_id
                : undefined,
            }
          })
        })
        return json
      })
  }

  orderCommonData(order) {
    const { address_id, id, remark, order_process_type_id } = order
    const { receive_begin_time, receive_end_time } = getReceiveTime(order)
    return {
      combine_goods_map: JSON.stringify(getCombineGoodsMap(order.skus)),
      details: getPostSkus(filterSkusCommon(order.skus), (sku, origin) => {
        return {
          ...sku,
          detail_customized_field: _.keys(origin.detail_customized_field).length
            ? origin.detail_customized_field
            : undefined,
        }
      }),
      address_id: address_id,
      uid: id,
      receive_begin_time,
      receive_end_time,
      remark,
      order_process_type_id,
    }
  }

  // 获取订单类型
  getAllOrderTypeValues() {
    this.orderTypeOptions = getOrderTypeList()
    const allOrderTypeValues = this.orderTypeOptions.map(({ value }) => value)
    return allOrderTypeValues
  }

  @action
  createValidate(order, receive_begin_time, receive_end_time) {
    const { time_config_info, skus, is_undelivery, undelivery_times } = order
    const {
      start,
      end,
      e_span_time,
      s_span_time,
    } = time_config_info.order_time_limit
    // 当前时间大于上一个下单时间的截止时间，且小于当前下单时间的开始时间。为不在下单时间范围内
    if (
      !isOrderTimeValid(
        'create',
        moment(),
        start,
        end,
        e_span_time,
        s_span_time,
      )
    ) {
      return Promise.reject(new Error(i18next.t('当前时间无法下单')))
    }
    if (
      moment(receive_begin_time, 'YYYY-MM-DD HH:mm').isSameOrAfter(
        receive_end_time,
      )
    ) {
      return Promise.reject(
        new Error(i18next.t('收货开始时间必须小于收货结束时间')),
      )
    }
    if (moment().isAfter(receive_end_time)) {
      return Promise.reject(
        new Error(i18next.t('收货结束时间必须大于当前时间')),
      )
    }

    // 校验是否存在不配送时间
    if (
      hasUnReceiveTimes(is_undelivery, undelivery_times, {
        receive_begin_time,
        receive_end_time,
      })
    ) {
      return Promise.reject(
        new Error(
          i18next.t('当前选择的收货时间包含了不配送时间段，请重新选择'),
        ),
      )
    }

    if (_.find(skus, (sku) => sku.code > 0)) {
      return Promise.reject(new Error(i18next.t('存在商品异常')))
    }

    if (_.find(skus, (sku) => !sku.quantity)) {
      return Promise.reject(new Error(i18next.t('未填写下单数')))
    }

    const vSku = _.find(
      skus,
      (sku) => +sku.quantity < (sku.sale_num_least || 0),
    )
    if (vSku) {
      return Promise.reject(
        new Error(
          i18next.t(
            /* src:`下单数须大于0，最多两位小数，且不小于最小下单数${sku.sale_num_least}` => tpl:下单数须大于0，最多两位小数，且不小于最小下单数${VAR1} */ 'KEY104',
            { VAR1: vSku.sale_num_least || 0 },
          ),
        ),
      )
    }

    if (_.find(skus, (sku) => !sku.sale_price)) {
      return Promise.reject(new Error(i18next.t('未填写金额')))
    }
    if (!skus.length) {
      return Promise.reject(new Error(i18next.t('请添加商品然后保存')))
    }
    return Promise.resolve()
  }

  @action
  async singleSave(index) {
    const orderDetail = this.details[index]
    const { time_config_info } = orderDetail
    if (!orderDetail) return Promise.reject(new Error('没有数据'))
    const data = this.orderCommonData(orderDetail)
    await this.createValidate(
      orderDetail,
      data.receive_begin_time,
      data.receive_end_time,
    ).catch((err) => {
      Tip.info(err.message)
      return Promise.reject(err)
    })
    const postData = {
      ...data,
      details: JSON.stringify(data.details),
      time_config_id: time_config_info._id,
      force: 1,
    }
    return Request('/station/order/create')
      .code([0, 10])
      .data(postData)
      .post()
      .then((result) => {
        const data = result.data
        let msgs = getOrderMsg(data)
        smsNotify(data.sms_notify_status)

        if (data.new_order_ids.length || data.update_order_ids.length) {
          msgs = [
            i18next.t('订单保存成功，订单号: '),
            data.new_order_ids[0] || data.update_order_ids[0],
          ]
          Tip.success(msgs.join(''))
          data.rounding?.length && Tip.success(getRoundingText(data.rounding))
          this.orderDelete(index)
          return result
        } else if (msgs.length) {
          return dialogMsgs(msgs)
        }
      })
  }

  @action
  batchSave() {
    let errMsg = ''
    const postData = _.map(this.details.slice(), (order, index) => {
      const data = this.orderCommonData(order)
      const {
        freight,
        total_price,
        is_undelivery,
        undelivery_times,
        // 订单备注
        remark,
      } = order
      if (remark?.length > 128) {
        errMsg = i18next.t('KEY210', {
          VAR1: index + 1,
        })
        return null
      }
      if (moment().isAfter(data.receive_begin_time)) {
        errMsg = i18next.t('收货开始时间必须大于当前时间')
        return null
      }
      if (freight && total_price < freight.min_total_price) {
        errMsg = i18next.t('未满足起送价') + freight.min_total_price
        return null
      }

      // 是否存在不配送时间设置
      if (
        hasUnReceiveTimes(is_undelivery, undelivery_times, {
          receive_begin_time: data.receive_begin_time,
          receive_end_time: data.receive_end_time,
        })
      ) {
        errMsg = i18next.t(
          '当前存在商户所选择的收货时间包含不配送时间段，请重新选择',
        )
        return null
      }

      return {
        ...data,
        timeStart: moment(order.timeStart).format('HH:mm'),
        timeEnd: moment(order.timeEnd).format('HH:mm'),
        flagStart: order.flagStart,
        flagEnd: order.flagEnd,
      }
    })

    if (errMsg) {
      Tip.warning(errMsg)
      return Promise.reject(new Error('batchCreateOrderErr'))
    }

    return Request('/station/order/batch/submit')
      .code([0, 1])
      .data({
        task_id: this.task_id,
        file_name: this.file_name,
        time_config_id: this.serviceTime._id,
        data: JSON.stringify(postData),
      })
      .post()
      .then((json) => {
        if (json.code) {
          Tip.warning(json.msg)
          return Promise.reject(new Error(json.msg))
        }
        smsNotify(json.data.sms_notify_status)
        return json
      })
  }

  @action
  getSkus(orderIndex, search_text) {
    const { address_id, time_config_info } = this.details[orderIndex]
    const req = {
      address_id: address_id,
      offset: 0,
      limit: 10,
      search_text,
      fetch_category: 1,
      active: 1,
      time_config_id: time_config_info._id,
      usual_type: 2,
      search_combine_goods: 1, // 搜索组合商品
    }

    return Request('/station/skus/addr')
      .data(req)
      .get()
      .then((json) => {
        asyncSkuInfo(json.data, this.details[orderIndex].skus)
        return json
      })
  }

  // order 数据变更
  @action
  orderEdit(orderIndex, data) {
    const order = this.details[orderIndex]
    this.details[orderIndex] = {
      ...order,
      ...data,
    }
  }

  @action
  orderDelete(orderIndex) {
    this.details.splice(orderIndex, 1)
  }

  // sku 数据变更
  @action
  skuAdd(orderIndex, sku) {
    const { orderCanHaveDuplicateSku } = globalStore.orderInfo
    const order = this.details[orderIndex]
    let skus = [sku]
    // 多sku下单无需同步，直接添加
    if (orderCanHaveDuplicateSku) {
      // 组合商品需要处理好原料
      if (sku.is_combine_goods) {
        skus = dealCombineGoodsData(sku)
      }
      order.skus.unshift(...skus)
      order.total_price = getOrderPrice(
        order.skus,
        order.freight,
        order.receive_way,
      )
      order.code = 0
      return
    }

    if (_.find(order.skus, (item) => item.id === sku.id && !item.belongWith))
      return
    if (sku.is_combine_goods) {
      // 组合商品
      asyncSalePriceInOrder(sku.skus, order.skus)
      skus = dealCombineGoodsData(sku)
      setSalePriceIfCombineGoods(skus)
    } else {
      asyncSalePriceInOrder(skus, order.skus)
    }

    order.skus.unshift(...skus)
    order.total_price = getOrderPrice(
      order.skus,
      order.freight,
      order.receive_way,
    )
    order.code = 0
  }

  @action
  skuEdit(orderIndex, skuIndex, params) {
    const order = this.details[orderIndex]
    const skus = order.skus
    const sku = skus[skuIndex]
    const p = {
      ...params,
      index: skuIndex,
      id: sku.id,
      belongWith: sku.belongWith,
    }

    // 多sku不需要同步价格
    const { orderCanHaveDuplicateSku } = globalStore.orderInfo
    if (!orderCanHaveDuplicateSku) {
      asyncSalePrice(p, skus)
      asyncSpuRemarkAndCustomize(p, skus)
    }

    if (sku.is_combine_goods && sku.isCombineGoodsTop) {
      asyncQuantityAndFakeQuantity(p, skus)
    }

    sku[params.key] = params.value
    order.total_price = getOrderPrice(
      order.skus,
      order.freight,
      order.receive_way,
    )
    order.code = 0
  }

  @action
  skuDelete(orderIndex, skuIndex) {
    const order = this.details[orderIndex]
    const skus = order.skus.slice()
    const sku = skus[skuIndex]
    if (sku.is_combine_goods) {
      deleteCombineGoods(skuIndex, skus)
    } else {
      skus.splice(skuIndex, 1)
    }
    order.skus = skus
    order.total_price = getOrderPrice(
      order.skus,
      order.freight,
      order.receive_way,
    )
    order.code = 0
  }

  @action
  skuTrans(orderIndex, skuIndex, newSku) {
    const order = this.details[orderIndex]
    const skus = order.skus
    const sku = skus[skuIndex]
    const isCombineGoods = sku.isCombineGoodsTop
    if (newSku.is_combine_goods) {
      const items = dealCombineGoodsData(newSku)
      setSalePriceIfCombineGoods(items)
      items.length && skus.splice(skuIndex, 1, ...items)
    } else {
      const otherInfo = isCombineGoods
        ? null
        : {
            quantity: sku.quantity,
            spu_remark: sku.spu_remark || '',
          }
      order.skus[skuIndex] = {
        ...newSku,
        ...otherInfo,
      }
    }
    order.code = 0
  }
}

export default new Store()
