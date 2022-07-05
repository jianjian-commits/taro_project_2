// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip, Dialog } from '@gmfe/react'
import { observable, action } from 'mobx'
import { getCharLength } from '@gm-common/tool'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'
import { convertDay2Bit } from '../../common/util'
import { convertNumber2Sid } from '../../common/filter'
import {
  isCustomerValid,
  fixNowMoment,
  isOrderTimeValid,
  getServiceTime,
  getReceiveTime,
  inValidSkuTip,
  getFirstAvailConfigTime,
  fixReceiveTime,
} from '../util'
import { history } from '../../common/service'
import OrderBaseOld from './order_base_old'
import globalStore from '../../stores/global'

const debounce = _.debounce((func) => {
  return func()
}, 300)

class OrderDetailStore extends OrderBaseOld {
  @observable orderDetail = Object.assign({}, this.initState.orderDetail)

  // dropSelect搜索数据
  @observable searchSkus = Object.assign({}, this.initState.searchSkus)

  @observable orderBatch = Object.assign({}, this.initState.orderBatch)

  @observable commonSkus = Object.assign({}, this.initState.commonSkus)

  @observable copyOrders = []

  @observable orderListImport = {
    importShow: false,
    isImporting: false,
  }

  @observable currentSearchText = '' // 记录当前搜索商品字段

  @action.bound
  get(id) {
    return Request('/station/order/edit')
      .data({ id: id })
      .get()
      .then((json) => {
        _.each(json.data && json.data.details, (v) => {
          v._spu_remark = v.spu_remark
        })
        const data = Object.assign({}, json.data, {
          details: json.data.details,
          freightFromDatabase: json.data.freight,
        })
        this.orderDetail = Object.assign(data, {
          viewType: 'view',
          freight: this.orderDetail.freight,
        })
        this.searchSkus = Object.assign({}, this.initState.searchSkus)
        return json.data
      })
  }

  /**
   * 保存订单
   * @param orderIndex 如果传入orderIndex,则来自批量提交订单
   * @returns {function(*, *)}
   */
  @action.bound
  save(orderIndex) {
    let orderDetail = this.orderDetail

    if (orderIndex !== undefined) {
      orderDetail = this.orderBatch.details[orderIndex]
    }

    // currentTime批量下单没有currentTime数据
    const {
      remark,
      viewType,
      _id,
      customer,
      time_config_info,
      currentTime,
      repair,
      details,
      order_date_time,
    } = orderDetail
    const {
      start,
      end,
      e_span_time,
      s_span_time,
    } = time_config_info.order_time_limit
    const { receive_begin_time, receive_end_time } = getReceiveTime(orderDetail)
    const currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm')

    // 当前时间大于上一个下单时间的截止时间，且小于当前下单时间的开始时间。为不在下单时间范围内
    if (
      !repair &&
      !isOrderTimeValid(
        viewType,
        currentTime,
        start,
        end,
        e_span_time,
        s_span_time,
      )
    ) {
      Tip.warning(i18next.t('当前时间无法下单'))
      return Promise.reject(new Error('createOrderErr'))
    }

    if (
      moment(receive_begin_time, 'YYYY-MM-DD HH:mm').isSameOrAfter(
        receive_end_time,
      )
    ) {
      Tip.warning(i18next.t('收货开始时间必须小于收货结束时间'))
      return Promise.reject(new Error('createOrderErr'))
    }
    if (
      moment(currentDate, 'YYYY-MM-DD HH:mm').isAfter(receive_end_time) &&
      !repair
    ) {
      Tip.warning(i18next.t('收货结束时间必须大于当前时间'))
      return Promise.reject(new Error('createOrderErr'))
    }
    if (!details.length) {
      Tip.warning(i18next.t('请添加商品然后保存'))
      return Promise.reject(new Error('createOrderErr'))
    }

    // 检查是否存在输入不正确的sku
    const inValidSku = _.find(details, (sku) => {
      return (
        sku.sale_num_least > sku.quantity ||
        sku.sale_price === '' ||
        sku?.spu_remark?.length > 50
      )
    })

    if (inValidSku) {
      inValidSkuTip(inValidSku)
      return Promise.reject(new Error('createOrderErr'))
    }

    const skus = _.map(this.reorderProduct(details), (sku) => {
      return {
        sku_id: sku.id,
        amount: sku.quantity,
        unit_price: sku.sale_price,
        spu_remark: sku.spu_remark,
        spu_id: sku.spu_id,
        is_price_timing: +sku.is_price_timing,
      }
    })
    let postData
    postData = {
      order_id: _id,
      details: JSON.stringify(skus),
      address_id: customer.address_id,
      address: customer.address,
      uid: customer.uid,
      receive_begin_time,
      receive_end_time,
      time_config_id: time_config_info._id,
      remark,
    }

    if (repair) {
      postData = {
        ...postData,
        // 新增用户指定下单时间
        date_time: order_date_time,
      }
    }

    return Request(
      repair ? '/station/order/create_old' : '/station/order/create',
    )
      .code([0, 10])
      .data(postData)
      .post()
      .then((json) => {
        // 该时间配置已有订单，则合单提醒
        if (json.code === 10) {
          const orderID = json.data[0] && json.data[0].order_id
          const dateTime = json.data[0] && json.data[0].date_time
          let confirmMsg = i18next.t('KEY85', { VAR1: orderID, VAR2: dateTime })

          if (remark !== null && remark !== '') {
            confirmMsg += i18next.t(
              '(订单备注将被新备注覆盖；若该订单已进入采购或分拣流程，不建议合单)',
            )
          } else {
            confirmMsg += i18next.t(
              '(若该订单已进入采购或分拣流程，不建议合单)',
            )
          }
          if (window.confirm(confirmMsg)) {
            postData.force = 2
          } else {
            postData.force = 1
          }
          return Request(
            repair ? '/station/order/create_old' : '/station/order/create',
          )
            .data(postData)
            .post()
        }

        return json
      })
      .then((result) => {
        const msgs = []
        const data = result.data
        let msg = null

        if (data.not_enough_inventories.length) {
          const msg = []
          for (let i = 0; i < data.not_enough_inventories.length; i++) {
            const v = data.not_enough_inventories[i]
            msg.push(
              i18next.t('KEY86', {
                VAR1: v.name,
                VAR2: v.count,
              }) /* src:v.name + "，还剩：" + v.count => tpl:${VAR1}，还剩：${VAR2} */,
            )
          }
          msgs.push([
            i18next.t('KEY87', { VAR1: msg.join(';') }),
          ]) /* src:'存在库存不足。' + msg.join(";") => tpl:存在库存不足。${VAR1} */
        }

        if (data.error_sku_ids.length) {
          msg = [
            i18next.t('部分商品提交失败，失败的商品：'),
            data.error_sku_ids.join('、'),
            i18next.t('请联系技术人员处理'),
          ]
          msgs.push(msg)
        }

        if (data.exceed_order_time_ids.length) {
          msg = [
            i18next.t('商品超过下单时间，超过的商品：'),
            data.exceed_order_time_ids.join('、'),
            i18next.t(
              '。无法购买对应供应商名称的商品，请核实可下单时间后提交订单',
            ),
          ]
          msgs.push(msg)
        }
        if (data.sms_notify_status === 2) {
          Tip.warning(i18next.t('短信余额不足，消息未发送，请及时充值！'))
        }

        if (data.new_order_ids.length || data.update_order_ids.length) {
          msg = [
            i18next.t('订单保存成功，订单号: '),
            data.new_order_ids[0] || data.update_order_ids[0],
          ]
          msgs.push(msg)
          Tip.success(msg.join(''))

          this.orderDetail = Object.assign({}, this.orderDetail, {
            time_config_info: null,
            customer: null,
            viewType: 'view',
            details: [],
          })
          this.searchSkus = Object.assign({}, this.initState.searchSkus)
        } else if (msgs.length) {
          Dialog.alert({
            children: _.map(msgs, (msg, i) => (
              <div key={i} style={{ wordWrap: 'break-word' }}>
                {_.map(msg, (item, j) => (
                  <div key={j}>{item}</div>
                ))}
              </div>
            )),
          })
        }
        return result
      })
  }

  reorderProduct(details) {
    const newItems = []
    _.forEach(details, (v) => {
      // 新增sku放后面
      if (v.isNew) {
        newItems.unshift(v)
      }
    })
    _.forEachRight(details, (v) => {
      // 已有sku放前面
      if (!v.isNew) {
        newItems.unshift(v)
      }
    })
    return newItems
  }

  @action
  processDetail(repair) {
    // 当商品为未称重时，出库数修改时input默认为空
    const orderDetail = Object.assign({}, this.orderDetail)
    let details = [...orderDetail.details]
    details = _.map(details, (v) => {
      v.std_real_quantity_backup = v.std_real_quantity
      v.std_real_quantity_backup_2 = v.std_real_quantity
      // eslint-disable-next-line gmfe/no-window-template-state
      if (!window.g_clean_food && !v.weighted && !v.out_of_stock) {
        v.std_real_quantity = ''
        v.std_real_quantity_backup_2 = ''
      }
      return v
    })

    const { receive_begin_time, receive_end_time } = orderDetail.customer
    const { time_config_info, date_time } = orderDetail
    const orderTimeStr = date_time
    const order_date = date_time.substr(0, 10)
    const { s_span_time, e_span_time } = time_config_info.receive_time_limit
    const start_order = time_config_info.order_time_limit.start
    const day_begin = moment(receive_begin_time.substr(0, 10))
    const day_end = moment(receive_end_time.substr(0, 10))
    const day_order = moment(order_date)
    const orderTime = moment(date_time).format('HH:mm')
    let timeStart, timeEnd, flagStart, flagEnd
    // 如果下单时间小于下单的开始和结束时间，则为上个周期
    if (moment(orderTime, 'HH:mm').isBefore(moment(start_order, 'HH:mm'))) {
      time_config_info.receive_time_limit.s_span_time = s_span_time - 1
      time_config_info.receive_time_limit.e_span_time = e_span_time - 1
    }
    const configTime = {
      timeStart: moment(receive_begin_time.substr(11), 'HH:mm'),
      timeEnd: moment(receive_end_time.substr(11), 'HH:mm'),
      flagStart: moment.duration(day_begin - day_order).asDays(),
      flagEnd: moment.duration(day_end - day_order).asDays(),
    }
    // 可能修改了运营时间
    if (repair) {
      timeStart = configTime.timeStart
      timeEnd = configTime.timeEnd
      flagStart = configTime.flagStart
      flagEnd = configTime.flagEnd
    } else {
      const result = fixReceiveTime(time_config_info, configTime, orderTimeStr)
      timeStart = result.timeStart
      timeEnd = result.timeEnd
      flagStart = result.flagStart
      flagEnd = result.flagEnd
    }

    console.log('receive time:', receive_begin_time, receive_end_time)
    orderDetail.timeStart = timeStart
    orderDetail.timeEnd = timeEnd
    orderDetail.flagStart = flagStart
    orderDetail.flagEnd = flagEnd
    orderDetail.order_date = order_date
    orderDetail.repair = repair // 追加修改

    this.orderDetail = Object.assign({}, orderDetail, {
      details,
    })
  }

  // 时价
  @action
  listChangeTiming(index, data) {
    const orderDetail = this.orderDetail
    let details = [...orderDetail.details]
    details = _.map(details, (v, i) => {
      if (+i === +index) {
        v.is_price_timing = data
      }
      return v
    })
    this.orderDetail = Object.assign({}, this.orderDetail, {
      details,
    })
  }

  @action
  clear(key = 'orderDetail') {
    this[key] = Object.assign({}, this.initState[key])
  }

  @action
  getParam() {
    const {
      _id,
      remark,
      timeStart,
      timeEnd,
      flagStart,
      flagEnd,
      date_time,
      repair,
      details,
      version,
    } = this.orderDetail
    const receive_begin_time =
      moment(date_time).add(flagStart, 'd').format('YYYY-MM-DD') +
      ' ' +
      timeStart.format('HH:mm')
    const receive_end_time =
      moment(date_time).add(flagEnd, 'd').format('YYYY-MM-DD') +
      ' ' +
      timeEnd.format('HH:mm')
    console.log('receive time:', receive_begin_time, receive_end_time)
    if (
      moment(receive_begin_time, 'YYYY-MM-DD HH:mm:ss').isSameOrAfter(
        receive_end_time,
      )
    ) {
      Tip.warning(i18next.t('收货开始时间必须小于收货结束时间'))
      return Promise.reject(new Error('updateOrderErr'))
    }
    if (
      !repair &&
      date_time &&
      moment(date_time).isSameOrAfter(
        moment(receive_begin_time, 'YYYY-MM-DD HH:mm:ss'),
      )
    ) {
      Tip.warning(i18next.t('下单时间必须小于收货开始时间'))
      return Promise.reject(new Error('updateOrderErr'))
    }
    // 检查是否存在输入不正确的sku
    const inValidSku = _.find(details, (sku) => {
      return (
        sku.sale_num_least > sku.quantity ||
        sku.sale_price === '' ||
        sku.real_quantity === '' ||
        sku?.spu_remark?.length > 50
      )
    })

    if (inValidSku) {
      inValidSkuTip(inValidSku)
      return Promise.reject(new Error('updateOrderErr'))
    }
    const isQuantityPermission = globalStore.hasPermission('edit_real_quantity')
    const skus = _.map(this.reorderProduct(details), (sku) => {
      const params = {
        sku_id: sku.id,
        amount: sku.quantity,
        unit_price: sku.sale_price,
        spu_remark: sku.spu_remark,
        spu_id: sku.spu_id,
        is_price_timing: +sku.is_price_timing,
      }
      // todo 订单修改:在出库数未改值的前提,后端返回的出库数为‘’, 首次修改为0时 +‘0’ === +‘’导致无法更新出库数.
      if (
        !isQuantityPermission ||
        sku.std_real_quantity === '' ||
        sku.std_real_quantity === undefined ||
        +sku.std_real_quantity === sku.std_real_quantity_backup_2
      ) {
        return params
      } else {
        return {
          ...params,
          std_real_quantity: sku.std_real_quantity,
        }
      }
    })
    return Promise.resolve({
      version,
      order_id: _id,
      details: JSON.stringify(skus),
      order_data: JSON.stringify({
        receive_begin_time,
        receive_end_time,
        remark,
      }),
    })
  }

  @action.bound
  checkReturnCoupon() {
    return this.getParam().then((params) => {
      return Request('/coupon/check_return').data(params).post()
    })
  }

  @action.bound
  async update() {
    const { repair, status, _id } = this.orderDetail
    const isStatusEditable = globalStore.hasPermission('edit_order_status')
    const params = await this.getParam()
    return Request(repair ? `/station/order/edit_old` : `/station/order/edit`)
      .code([0, 3])
      .data(params)
      .post()
      .then((json) => {
        if (json.code) {
          const sku = json.data[0]
          Tip.warning(
            i18next.t('KEY79', {
              VAR1: sku.name,
              VAR2: sku.count,
            }) /* src:`${sku.name}库存不足，库存数:${sku.count}` => tpl:${VAR1}库存不足，库存数:${VAR2} */,
          )
          return Promise.reject(new Error('updateOrderErr'))
        }

        if (isStatusEditable) {
          return Request('/station/order/set_status')
            .data({
              order_ids: [_id],
              status,
            })
            .post()
            .then(() => {
              Tip.success(
                i18next.t('KEY80', {
                  VAR1: json.data.order_id,
                }) /* src:`订单${json.data.order_id}修改成功` => tpl:订单${VAR1}修改成功 */,
              )
            })
        }

        return null
      })
      .then(() => {
        // 2个请求都成功，则更新view
        this.orderDetail = Object.assign({}, this.orderDetail, {
          viewType: 'view',
        })
        this.searchSkus = Object.assign({}, this.initState.searchSkus)
        // 保存成功,重新拉取数据
        this.get(_id)
      })
  }

  @action.bound
  skuUpload(postData) {
    return Request('/station/order/import')
      .data(postData)
      .post()
      .then((json) => {
        this.orderDetail = Object.assign({}, this.orderDetail, {
          details: json.data,
        })
      })
  }

  /**
   * 下单页u
   * @param search_text
   * @param batchOrderIndex 批量订单索引
   * @returns {function(*=, *)}
   */
  @action.bound
  debounceSearchSku(search_text, batchOrderIndex) {
    if (!search_text) {
      this.searchSkus = Object.assign({}, this.initState.searchSkus)
      return
    }

    let orderDetail
    if (batchOrderIndex !== undefined) {
      orderDetail = this.orderBatch.details[batchOrderIndex]
    } else {
      orderDetail = this.orderDetail
    }

    this.currentSearchText = search_text

    debounce(() => {
      this.searchSkus = { list: [], loading: true }

      this.getAddressSkus(orderDetail, search_text, 2)
        .then((data) => {
          if (search_text === this.currentSearchText) {
            this.searchSkus = { list: data, loading: false }
          } else {
            this.searchSkus.loading = false
          }
        })
        .catch(() => {
          this.searchSkus = Object.assign({}, this.initState.searchSkus)
        })
    })
  }

  @action.bound
  customerSearch(search_text) {
    const params = { search_text }
    if (search_text !== undefined) {
      params.limit = 20
    }

    return Request('/station/order/customer/search')
      .data(params)
      .get()
      .then((json) => {
        const list = _.map(json.data.list, (customer) => ({
          id: customer.address_id,
          address_id: customer.address_id,
          uid: customer.id,
          name: customer.resname,
          resname: `${customer.resname}(${convertNumber2Sid(
            customer.address_id,
          )}/${customer.username})`,
          receiver_name: customer.receiver_name,
          receiver_phone: customer.receiver_phone,
          address: customer.address,
          username: customer.username,
          extender: {
            resname: `${customer.resname}`,
          },
          fee_type: customer.fee_type,
        }))

        // 首次搜索
        if (search_text === undefined) {
          this.orderDetail = Object.assign({}, this.orderDetail, {
            customers: list,
            customersNoMore: json.data.no_more,
          })
        }
        return list
      })
  }

  @action.bound
  customerStatusRefesh(address_id, batchOrderIndex) {
    // json.data.type 含义:  0，正常；11，白名单；12，信用额度内；13，超额；14，欠款（当没授信的时候返回）; 15,冻结; 16,先款后货用户无法在此下单; 100,其他
    return Request('/station/check_unpay')
      .data({ address_id })
      .get()
      .then((json) => {
        if (batchOrderIndex === undefined) {
          const customer = {
            ...this.orderDetail.customer,
            msg: json.data.msg,
            customer_credit_type: json.data.type,
            customer_credit_info: json.data,
          }

          this.orderDetail = Object.assign({}, this.orderDetail, {
            customer,
            time_config_info: isCustomerValid(customer)
              ? this.orderDetail.time_config_info
              : null,
          })
        } else {
          const batchOrders = [...this.orderBatch.details]
          const orderDetail = batchOrders[batchOrderIndex]
          orderDetail.customer.msg = json.data.msg
          orderDetail.customer.customer_credit_type = json.data.type
          orderDetail.customer.customer_credit_info = json.data

          this.orderBatch = Object.assign({}, this.orderBatch, {
            details: batchOrders,
          })
        }
      })
  }

  @action
  viewTypeChange(viewType, repair = false) {
    this.orderDetail = Object.assign({}, this.orderDetail, { viewType, repair })
  }

  @action
  serviceTimeChange(serviceTime) {
    const orderDetail = Object.assign({}, this.orderDetail)
    if (!serviceTime) {
      orderDetail.time_config_info = null
      this.orderDetail = orderDetail
    }

    const {
      start,
      end,
      s_span_time,
      receiveEndSpan,
      e_span_time,
      receiveTimeSpan,
      weekdays,
      customer_weekdays,
    } = serviceTime.receive_time_limit
    const nowMoment = fixNowMoment(start, receiveTimeSpan)
    let flagStart = s_span_time
    let flagEnd

    // 是预售类型
    if (serviceTime.type === 2) {
      const filter = weekdays & customer_weekdays
      flagEnd = receiveEndSpan !== 1 ? s_span_time : s_span_time + 1
      if (filter !== 127) {
        const configTime = getFirstAvailConfigTime(serviceTime, filter)
        flagStart = configTime.flagStart
        flagEnd = configTime.flagEnd
      }
    } else {
      // 跨天收货
      flagEnd = s_span_time === e_span_time ? s_span_time : s_span_time + 1
    }

    let timeStart = moment(start, 'HH:mm')
    const timeEnd = moment(end, 'HH:mm')
    if (timeStart < nowMoment && flagStart === 0) {
      timeStart = nowMoment
    }

    const timesObj = getServiceTime(
      serviceTime.receive_time,
      { timeStart, timeEnd, flagStart, flagEnd },
      serviceTime.receive_time_limit,
      serviceTime.type,
    )
    this.orderDetail = Object.assign({}, this.orderDetail, {
      ...orderDetail,
      ...timesObj,
      time_config_info: serviceTime,
      details: [],
      order_date_time: orderDetail.repair
        ? `${moment().format('YYYY-MM-DD')} ${moment(
            serviceTime.order_time_limit.start,
            'HH:mm',
          ).format('HH:mm:ss')}`
        : '',
    })
    this.searchSkus = Object.assign({}, this.initState.searchSkus)
  }

  @action
  customerSelect(customer) {
    this.orderDetail = Object.assign({}, this.orderDetail, {
      fee_type: customer.fee_type,
      customer: customer,
      serviceTimesLoading: !!customer,
      serviceTimes: [],
      time_config_info: null,
      details: [],
    })
    if (!customer) return

    return Request('/station/order/service_time')
      .data({ address_id: customer.id })
      .get()
      .then((json) => {
        const { service_time, time, freight } = json.data

        _.each(service_time, (serviceTime) => {
          const { e_span_time } = serviceTime.order_time_limit
          const start_order = serviceTime.order_time_limit.start
          const isLastCycle = moment(time, 'HH:mm').isBefore(
            moment(start_order, 'HH:mm'),
          )
          // 如果当前时间小于下单的开始和结束时间，则为上个周期
          if (isLastCycle) {
            serviceTime.receive_time_limit.s_span_time--
            serviceTime.receive_time_limit.e_span_time--
          }
          if (e_span_time === 1 && isLastCycle) {
            serviceTime.order_time_limit.s_span_time = -1
            serviceTime.order_time_limit.e_span_time = 0
          } else {
            serviceTime.order_time_limit.s_span_time = 0
            serviceTime.order_time_limit.e_span_time = e_span_time
          }
        })

        this.orderDetail = Object.assign({}, this.orderDetail, {
          serviceTimes: service_time,
          currentTime: time,
          freight,
          serviceTimesLoading: false,
        })

        // 如果只有一个运营时间，则默认选中
        if (service_time.length === 1) {
          this.serviceTimeChange(service_time[0])
        }
      })
  }

  @action.bound
  getFreight(address_id, batchOrderIndex = null) {
    return Request('/station/order/service_time')
      .data({ address_id })
      .get()
      .then((json) => {
        const { freight } = json.data
        if (batchOrderIndex !== null) {
          const batchOrders = [...this.orderBatch.details]
          const orderDetail = batchOrders[batchOrderIndex]
          orderDetail.freight = freight
          this.orderBatch = Object.assign({}, this.orderBatch, {
            details: batchOrders,
          })
        } else {
          this.orderDetail = Object.assign({}, this.orderDetail, {
            freight,
          })
        }
        return json
      })
  }

  @action
  fixBatchReceiveTime() {
    const details = this.orderBatch.details.slice() || []
    _.forEach(details, (detail) => {
      const serviceTime = detail.time_config_info
      const { weekdays, customer_weekdays } = serviceTime.receive_time_limit
      if (serviceTime.type === 2) {
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
    this.orderBatch.details = details
  }

  @action
  // 获取商户上一次订单的备注
  getLastOrderRemark(address_id) {
    return Request('/station/order/last_order_remark')
      .data({ address_id })
      .get()
      .then((json) => {
        this.orderDetail = {
          ...this.orderDetail,
          last_remark: json.data.last_remark,
        }
      })
  }

  @action
  // 选中上一次订单的备注
  selectLastRemark(last_remark) {
    const orderDetail = this.orderDetail
    orderDetail.remark = last_remark
  }

  /**
   *
   * @param {num} index
   * @param {key, value} param eg.{key: 'quantity', value; 123}
   */
  @action
  skuUpdate(index, param) {
    const details = [...this.orderDetail.details]
    const detail = details[index]
    detail[param.key] = param.value
    this.orderDetail = Object.assign({}, this.orderDetail, {
      details,
    })
  }

  @action
  skuDel(index) {
    const { _id, details } = this.orderDetail
    const sku = details[index]
    details.splice(index, 1)
    this.orderDetail = Object.assign({}, this.orderDetail, {
      details,
    })
    // 如果有_id，则是订单详情页, 并且不是新加入且未提交的商品
    if (_id && !sku.isNew) {
      const isLastSku =
        _.reject(details, (s) => {
          return s.isNew
        }).length === 0
      isLastSku && history.push('/order_manage/order')
    }
  }

  @action
  skuAdd(sku) {
    this.skusAdd([sku])
  }

  @action
  skusAdd(skus) {
    const details = [...this.orderDetail.details]
    _.map(skus, (sku) => {
      // 是否已经在sku列表中
      const skuOld = _.find(details, (s) => {
        return s.id === sku.id
      })
      if (!skuOld) {
        details.unshift(
          Object.assign({}, sku, {
            isNew: true,
            quantity: sku.sale_num || sku.sale_num_least,
          }),
        )
      }
    })

    this.orderDetail = Object.assign({}, this.orderDetail, {
      details,
    })
  }

  @action
  skuMove(sIndex, dIndex) {
    const details = [...this.orderDetail.details]

    const [removed] = details.splice(sIndex, 1)
    details.splice(dIndex, 0, removed)

    this.orderDetail = Object.assign({}, this.orderDetail, {
      details,
    })
  }

  @action
  editableToggle(repair = false) {
    const orderDetail = Object.assign({}, this.orderDetail)

    if (
      orderDetail.viewType === 'view' &&
      orderDetail.customer.receive_begin_time
    ) {
      this.processDetail(repair)
      if (this.orderDetail.detailsBeforeRank) {
        orderDetail.details = this.orderDetail.detailsBeforeRank
        this.orderDetail.detailsBeforeRank = null
      }
      orderDetail.viewType = 'edit'
    } else {
      orderDetail.viewType = 'view'
      orderDetail.repair = false
    }

    this.orderDetail = Object.assign({}, this.orderDetail, orderDetail)
  }

  @action
  receiveChange(options) {
    this.orderDetail = Object.assign({}, this.orderDetail, options)
  }

  @action
  importChange(data) {
    this.orderListImport = Object.assign({}, this.orderListImport, data)
  }

  /**
   * bacth 以下
   * @param {*} index
   * @param {key, value} map eg. {key: 'remark_key', value: 'remark_value'}
   * @param {*} batchOrderIndex
   */
  @action
  skuUpdateBatch(index, map, batchOrderIndex) {
    const batchOrders = [...this.orderBatch.details]
    const orderDetail = batchOrders[batchOrderIndex]
    const { details } = orderDetail
    const detail = details[index]
    detail[map.key] = map.value

    this.orderBatch = Object.assign({}, this.orderBatch, {
      details: batchOrders,
    })
  }

  @action
  skuAddBatch(sku, batchOrderIndex) {
    const batchOrders = [...this.orderBatch.details]
    const orderDetail = batchOrders[batchOrderIndex]
    const { details } = orderDetail
    // 是否已经在sku列表中
    const skuOld = _.find(details, (s) => {
      return s.id === sku.id
    })

    if (!skuOld) {
      details.unshift(
        Object.assign({}, sku, {
          isNew: true,
          quantity: sku.sale_num_least,
        }),
      )
      this.orderBatch = Object.assign({}, this.orderBatch, {
        details: batchOrders,
      })
    }
  }

  @action
  skuDelBatch(index, batchOrderIndex) {
    const batchOrders = [...this.orderBatch.details]
    const orderDetail = batchOrders[batchOrderIndex]
    const { details } = orderDetail
    details.splice(index, 1)

    this.orderBatch = Object.assign({}, this.orderBatch, {
      details: batchOrders,
    })
  }

  @action
  skuMoveBatch(sIndex, dIndex, batchOrderIndex) {
    const batchOrders = [...this.orderBatch.details]
    const orderDetail = batchOrders[batchOrderIndex]
    const { details } = orderDetail

    const [removed] = details.splice(sIndex, 1)
    details.splice(dIndex, 0, removed)

    this.orderBatch = Object.assign({}, this.orderBatch, {
      details: batchOrders,
    })
  }

  @action
  receiveChangeBatch(options, batchOrderIndex) {
    const batchOrders = [...this.orderBatch.details]
    const orderDetail = batchOrders[batchOrderIndex]
    Object.assign(orderDetail, options)
    this.orderBatch = Object.assign({}, this.orderBatch, {
      details: batchOrders,
    })
  }

  @action
  returnCustomer(detail) {
    return {
      extender: {
        resname: detail.resname,
      },
      msg: detail.msg || '',
      address_id: detail.address_id,
      id: detail.id,
      uid: detail.id,
      address: detail.address,
      receiver_name: detail.receiver_name,
      receiver_phone: detail.receiver_phone,
    }
  }

  @action.bound
  batchUpload(
    time_config_id,
    file,
    time_config_info,
    { flagStartMin, flagEndMax },
  ) {
    const { e_span_time } = time_config_info.order_time_limit
    const start_order = time_config_info.order_time_limit.start
    // 如果当前时间小于下单的开始和结束时间，则为上个周期
    if (e_span_time === 1 && moment().isBefore(moment(start_order, 'HH:mm'))) {
      time_config_info.order_time_limit.s_span_time = -1
      time_config_info.order_time_limit.e_span_time = 0
    } else {
      time_config_info.order_time_limit.s_span_time = 0
      time_config_info.order_time_limit.e_span_time = e_span_time
    }

    return Request('/station/order/batch/upload', { timeout: 60000 })
      .data({ time_config_id, file })
      .post()
      .then((json) => {
        if (!json.data.details.length) {
          Tip.warning(i18next.t('所有商品下单数为0'))
          return Promise.reject(new Error('skuNumErr'))
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

        _.each(json.data.details, (detail) => {
          const timeStart = timeStartConfig
          const timeEnd = timeEndConfig
          const receiveTimeLimit =
            detail.receive_time_limit || time_config_info.receive_time_limit
          detail.customer = this.returnCustomer(detail)
          detail.details = detail.skus
          delete detail.skus
          const timeObj = getServiceTime(
            detail.receive_time,
            {
              timeStart,
              timeEnd,
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
          detail.timeStart = timeObj.timeStart
          detail.timeEnd = timeObj.timeEnd
          detail.flagStart = timeObj.flagStart
          detail.flagEnd = timeObj.flagEnd
          detail.time_config_info = Object.assign({}, time_config_info, {
            receive_time_limit: receiveTimeLimit,
          })
          detail.viewType = 'batch'
        })
        this.orderBatch = Object.assign({}, json.data)
      })
  }

  @action.bound
  batchErrorListFetch(task_id) {
    return Request('/station/order/batch/result')
      .data({ task_id })
      .get()
      .then((json) => {
        _.each(json.data.details, (detail) => {
          const { receive_time_limit } = detail
          let time_config_info = json.data.time_config
          if (receive_time_limit) {
            time_config_info = {
              ...time_config_info,
              receive_time_limit,
            }
          }

          detail.customer = this.returnCustomer(detail)
          detail.details = detail.skus
          delete detail.skus
          detail.timeStart = moment(detail.timeStart, 'HH:mm')
          detail.timeEnd = moment(detail.timeEnd, 'HH:mm')
          detail.time_config_info = time_config_info
          detail.viewType = 'batch'
        })

        this.orderBatch = Object.assign({}, json.data)
        return json.data.details
      })
  }

  @action
  batchSetTaskId(task_id) {
    this.orderBatch = Object.assign({}, this.orderBatch, {
      task_id,
      details: [],
    })
  }

  @action
  batchSigleOrderDelete(index) {
    const details = [...this.orderBatch.details]
    details.splice(index, 1)
    this.orderBatch = Object.assign({}, this.orderBatch, {
      details,
    })
  }

  @action.bound
  batchOrderAmend(task_id, address_id, order_id) {
    return Request('/station/order/batch/amend')
      .data({ task_id, order_id, address_id })
      .post()
  }

  @action.bound
  batchOrderSubmit() {
    const orderBatch = this.orderBatch
    const currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm')
    let hasErrCycle = false
    const postData = _.map(orderBatch.details, (order) => {
      const receive_begin_time =
        moment().add(order.flagStart, 'd').format('YYYY-MM-DD') +
        ' ' +
        order.timeStart.format('HH:mm')
      const receive_end_time =
        moment().add(order.flagEnd, 'd').format('YYYY-MM-DD') +
        ' ' +
        order.timeEnd.format('HH:mm')
      console.log('receive time:', receive_begin_time, receive_end_time)
      if (moment(currentDate, 'YYYY-MM-DD HH:mm').isAfter(receive_end_time)) {
        hasErrCycle = true
        return null
      }
      return {
        remark: order.remark,
        address_id: order.address_id,
        uid: order.id,
        receive_begin_time,
        receive_end_time,
        details: _.map(order.details, (sku) => ({
          sku_id: sku.id,
          amount: sku.quantity,
          unit_price: sku.sale_price,
          spu_remark: sku.spu_remark,
          spu_id: sku.spu_id,
        })),
        timeStart: moment(order.timeStart).format('HH:mm'),
        timeEnd: moment(order.timeEnd).format('HH:mm'),
        flagStart: order.flagStart,
        flagEnd: order.flagEnd,
      }
    })
    if (hasErrCycle) {
      Tip.warning(i18next.t('收货结束时间必须大于当前时间'))
      return Promise.reject(new Error('batchCreateOrderErr'))
    }
    return Request('/station/order/batch/submit')
      .code([0, 1])
      .data({
        task_id: orderBatch.task_id,
        file_name: orderBatch.file_name,
        time_config_id: orderBatch.details[0].time_config_info._id,
        data: JSON.stringify(postData),
      })
      .post()
      .then((json) => {
        if (json.data.sms_notify_status === 2) {
          // 0: 没有开启station下单短信提醒, 1: 开启短信提醒且余额够, 2: 开启短信提醒但余额不够
          Tip.warning(i18next.t('短信余额不足，消息未发送，请及时充值！'))
        }
      })
  }

  @action
  getCommonSkuList(search_text) {
    debounce(() => {
      this.commonSkus = { search_text: '', list: [] }

      this.getAddressSkus(this.orderDetail, search_text, 1)
        .then((data) => {
          this.commonSkus = { list: data, search_text }
        })
        .catch(() => {
          this.commonSkus = Object.assign({}, this.initState.commonSkus)
        })
    })
  }

  /**
   * @param {*} orderDetail
   * @param {*} search_text
   * @param {*} usual_type 1: 常用商品列表 2： 一般sku搜索
   */
  @action
  getAddressSkus(orderDetail, search_text, usual_type) {
    const { customer, time_config_info } = orderDetail
    const req = {
      address_id: customer.address_id,
      offset: 0,
      limit: 10,
      search_text,
      fetch_category: 1,
      active: 1,
      time_config_id: time_config_info._id,
      usual_type,
    }

    return Request('/station/skus/addr')
      .data(req)
      .get()
      .then((json) => {
        // 如果订单中已有该商品,则同步起数量和价格
        _.every(json.data, (sku1) => {
          _.every(this.orderDetail.details, (sku2) => {
            if (sku1.id === sku2.id) {
              sku1.quantity = sku2.quantity
              sku1.sale_price = sku2.sale_price
              return false
            }
            return true
          })

          // 产品改动，订单备注默认是空，提供快速选择功能，so找另外个字段存起来
          sku1._spu_remark = sku1.spu_remark
          sku1.spu_remark = ''
          return true
        })
        return json.data
      })
  }

  @action
  changeCommonSkuListSku(id, val) {
    const skus = [...this.commonSkus.list]
    _.forEach(skus, (v) => {
      if (v.id === id) v.quantity = val
    })

    this.commonSkus = Object.assign({}, this.commonSkus, { list: skus })
  }

  @action
  getCopyOrders(address_id, time_config_id) {
    return Request('/station/order/recent_order/get')
      .data({ address_id, time_config_id })
      .get()
      .then((json) => {
        this.copyOrders = json.data
      })
  }

  @action
  copyOrder(order_id) {
    return Request('/station/order/copy')
      .data({ order_id })
      .get()
      .then((json) => {
        this.orderDetail = {
          ...this.orderDetail,
          details: json.data,
        }
      })
  }
}

export default new OrderDetailStore()
