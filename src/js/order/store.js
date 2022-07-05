import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import Big from 'big.js'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { action, computed, observable, runInAction, toJS } from 'mobx'
import moment from 'moment'
import { getOrderTypeId } from '../common/deal_order_process'
import { convertNumber2Sid } from '../common/filter'
import globalStore from '../stores/global'
import { orderDetailInit, skuInit } from './init'
import {
  getSkusPrice,
  getSkusQuantity,
  mapForChange,
} from './order_detail/util'
import {
  asyncQuantityAndFakeQuantity,
  asyncSalePrice,
  asyncSkuInfo,
  asyncSpuRemarkAndCustomize,
  dealCombineGoodsList,
  deleteCombineGoods,
  dialogMsgs,
  filterSkus,
  fixNowMoment,
  fixReceiveTime,
  getCombineGoodsMap,
  getConfirmMsg,
  getFirstAvailConfigTime,
  getOrderMsg,
  getPostSkus,
  getReceiveTime,
  getRoundingText,
  getServiceTime,
  hasUnReceiveTimes,
  inValidSkuTip,
  isCustomerValid,
  isLK,
  isOrderTimeValid,
  squeshQoutePriceList,
  toCombineGoodsIfExist,
  transformHistoryPrice,
} from './util'

class Store {
  @observable orderDetail = Object.assign({}, orderDetailInit)

  @observable orderListImport = {
    importShow: false,
    isImporting: false,
  }

  @observable loading = true
  @observable refPriceType = 1

  // 是否自提
  @observable isPickUp = false

  @observable turnover_data = []
  @observable pickUpList = []
  copyData = null
  repeatedSku = null

  @observable step_price_table = [] // 阶梯价表格数据

  getInitItem() {
    return { ...skuInit }
  }

  @action
  initStepPriceTable(value) {
    this.step_price_table = _.map(value, (e) => {
      return {
        ...e,
        step_sale_price: Big(e.step_sale_price).div(100).toFixed(2),
        step_std_price: Big(e.step_std_price).div(100).toFixed(2),
      }
    })
  }

  // 智能识别窗口关闭时间以及商户信息
  recognitionData = {
    hideTime: moment(),
    customerId: null,
  }

  setRepeatedSku(sku) {
    this.repeatedSku = sku
  }

  setRecognition() {
    const id = this.orderDetail.customer.address_id
    this.recognitionData = {
      hideTime: moment(),
      customerId: id,
    }
  }

  setCopyData(obj) {
    this.copyData = obj
  }

  retCopyData() {
    this.copyData = null
  }

  /** 下单金额，出库金额，销售额计算 */
  @computed
  get summary() {
    const order = {
      freight: this.orderDetail.freight,
      details: this.orderDetail.details.map((v) => ({
        id: v.id,
        is_price_timing: v.is_price_timing,
        isCombineGoodsTop: v.isCombineGoodsTop,
        quantity: v.quantity,
        sale_price: v.sale_price,
        std_real_quantity: v.std_real_quantity,
        sale_ratio: v.sale_ratio,
        out_of_stock: v.out_of_stock,
        sorting_unit: v.sorting_unit,
        std_sale_price_forsale: v.std_sale_price_forsale,
      })),
      viewType: this.orderDetail.viewType,
      total_pay: this.orderDetail.total_pay,
      total_price: this.orderDetail.total_price,
      real_price: this.orderDetail.real_price,
      abnormal_money: this.orderDetail.abnormal_money,
      refund_money: this.orderDetail.refund_money,
      coupon_amount: this.orderDetail.coupon_amount,
      receive_way: this.orderDetail.receive_way,
    }

    return getSkusPrice(order)
  }

  @computed
  get settlementTime() {
    const {
      time_config_info,
      dateStart,
      flagStart,
      viewType,
      repair,
      settlement_time,
      date_time,
    } = this.orderDetail
    let settlementTime = settlement_time || null
    if (!time_config_info || time_config_info?.pstatus === 1) return null
    if (viewType === 'create' && !settlementTime) {
      if (repair && dateStart) {
        // 补录
        settlementTime = moment(dateStart).startOf('day').toJSON()
      }
      if (!repair && _.isNumber(flagStart)) {
        settlementTime = moment(date_time).add(flagStart, 'day').toDate()
      }
    }
    return settlementTime
  }

  // 统计商品的下单数
  @computed
  get skusQuantity() {
    const details = _.map(this.orderDetail.details, (sku) => ({
      id: sku.id,
      quantity: sku.quantity,
      sale_num_least: sku.sale_num_least,
    }))
    return getSkusQuantity(details)
  }

  @action.bound
  getPickUpListRequest() {
    return Request('/station/pick_up_station/list').data({ limit: 0 }).get()
  }

  @computed
  get firstPickUp() {
    return this.pickUpList[0] || {}
  }

  @action.bound
  async getPickUpList() {
    if (this.pickUpList?.length === 0 && !this.pickUpList?.isRequest) {
      const json = await this.getPickUpListRequest()
      runInAction(() => {
        const filter = _.filter(json.data, (item) => {
          return item.business_status === 1
        })
        this.pickUpList = _.map(filter, (item) => {
          return { value: item.id, text: item.name, address: item.address }
        })

        this.pickUpList.isRequest = true
      })
    }
    return this.pickUpList
  }

  @action.bound
  refPriceTypeSet(type) {
    this.refPriceType = type
  }

  @action
  clear() {
    this.orderDetail = { ...orderDetailInit }
  }

  @action
  get(id) {
    this.loading = true
    return Request('/station/order/edit')
      .data({ id: id, is_duplicate_sku: 1 })
      .get()
      .then((json) => {
        _.each(json.data && json.data.details, (v) => {
          v._spu_remark = v.spu_remark
          if (globalStore.isHuaKang()) {
            v.self_acquisition_quantity = v.self_acquisition_quantity || null
            v.after_sale_outstock_quantity_fe = v.after_sale_quantity || null
          }
        })
        runInAction(() => {
          this.orderDetail = Object.assign(
            {
              ...orderDetailInit,
            },
            json.data,
            {
              details: squeshQoutePriceList(
                json.data.details.map((v) => ({
                  ...v,
                  detail_customized_field: v.detail_customized_field || {},
                  backup_sale_price: Big(v.sale_price || 0).toString(),
                  sale_price: Big(v.sale_price || 0).toFixed(2),
                })),
              ),
              combine_goods_map: json.data.combine_goods_map || {},
              freightFromDatabase: json.data.freight,
              viewType: 'view',
              ostatus: json.data.status,
              freight: this.orderDetail.freight,
              orderType: json.data.order_process_type_id,
              orderTypeName: json.data.order_process_name,
              customized_field: json.data.customized_field || {},
            },
          )
          this.loading = false
          this.isPickUp = !!json.data.customer.pick_up_st_id
        })
        console.log('this.orderDetail:', toJS(this.orderDetail.details))
        return json.data
      })
  }

  getInValidSkus = (skuData) => {
    // 检查是否存在输入不正确的sku
    const inValidSku = _.find(skuData, (sku) => {
      // 总下单数进行判断
      const nowSku = _.find(this.skusQuantity, (item) => item.id === sku.id)
      const totalQuantity = (nowSku && nowSku.totalQuantity) || sku.quantity
      return (
        sku.sale_num_least > totalQuantity ||
        sku.sale_price === '' ||
        sku?.spu_remark?.length > 100
      )
    })
    return inValidSku
  }

  @action
  getCreateParams() {
    const orderDetail = this.orderDetail
    // currentTime批量下单没有currentTime数据
    const {
      remark,
      viewType,
      customer,
      time_config_info,
      currentTime,
      repair,
      details,
      order_date_time,
      orderType,
      customized_field,
      receive_way,
      pick_up_st_id,
    } = this.orderDetail
    const {
      start,
      end,
      e_span_time,
      s_span_time,
    } = time_config_info.order_time_limit
    const { is_undelivery, undelivery_times } = time_config_info
    const { receive_begin_time, receive_end_time } = getReceiveTime(orderDetail)

    // 过滤为空的项
    const skuData = filterSkus(details)

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

    // 若开启了不配送时间设置，检查当前所选时间是否合法
    if (
      hasUnReceiveTimes(is_undelivery, undelivery_times, {
        receive_begin_time,
        receive_end_time,
      })
    ) {
      Tip.warning(i18next.t('当前选择的收货时间包含不配送时间段，请重新选择'))
      return Promise.reject(new Error('createOrderErr'))
    }

    if (moment().isAfter(receive_end_time) && !repair) {
      Tip.warning(i18next.t('收货结束时间必须大于当前时间'))
      return Promise.reject(new Error('createOrderErr'))
    }

    if (!skuData.length) {
      Tip.warning(i18next.t('请添加商品然后保存'))
      return Promise.reject(new Error('createOrderErr'))
    }
    // 检查是否存在输入不正确的sku
    const inValidSku = this.getInValidSkus(skuData)
    if (inValidSku) {
      inValidSkuTip(inValidSku)
      return Promise.reject(new Error('createOrderErr'))
    }

    const skus = getPostSkus(skuData, (params, sku) => {
      if (globalStore.isHuaKang()) {
        params.self_acquisition_quantity = sku.self_acquisition_quantity || 0
        params.after_sale_quantity = sku.after_sale_outstock_quantity_fe || 0
      }
      if (_.keys(sku.detail_customized_field).length) {
        params.detail_customized_field = sku.detail_customized_field
      }
      return params
    })
    let postData = {
      combine_goods_map: JSON.stringify(getCombineGoodsMap(details)),
      details: JSON.stringify(skus),
      address_id: customer.address_id,
      uid: customer.uid,
      receive_way: receive_way,
      address: receive_way === 2 ? customer.pickAddress : customer.address,
      receive_begin_time,
      receive_end_time,
      time_config_id: time_config_info._id,
      remark,
    }
    if (receive_way === 2) {
      postData.pick_up_st_id = pick_up_st_id
    }
    if (_.keys(customized_field).length) {
      postData.customized_field = JSON.stringify(customized_field)
    }

    if (globalStore.isHuaKang()) {
      postData.settlement_time = this.settlementTime
        ? moment(this.settlementTime)
            .startOf('day')
            .format('YYYY-MM-DD HH:mm:ss')
        : null
    }

    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      postData = {
        ...postData,
        order_process_type_id,
      }
    }

    if (repair) {
      postData = {
        ...postData,
        // 新增用户指定下单时间
        date_time: order_date_time,
      }
    }

    return Promise.resolve(postData)
  }

  @action.bound
  validOrder(postData) {
    if (postData.receive_way === 2 && postData.pick_up_st_id === '') {
      return '请选择自提点'
    }
    return ''
  }

  /**
   * 保存订单
   * @param continueCreate 继续创建
   * @returns {function(*, *)}
   */
  @action.bound
  async save(continueCreate = false) {
    const { remark, repair } = this.orderDetail
    const postData = await this.getCreateParams()
    const validResult = this.validOrder(postData)
    if (validResult) {
      Tip.warning(validResult)
      return {}
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
          const confirmMsg = getConfirmMsg(json.data[0], remark)
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
        const data = result.data
        let msg = null
        const msgs = getOrderMsg(data)

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
          data.rounding?.length && Tip.success(getRoundingText(data.rounding))
          this.orderDetail.time_config_info = null
          this.orderDetail.customer = null
          this.orderDetail.viewType = continueCreate ? 'create' : 'view'
          this.orderDetail.details = []
          // 保存并继续新建/创建清除备注
          this.orderDetail.remark = ''
        } else if (msgs.length) {
          dialogMsgs(msgs)
        }
        return result
      })
  }

  @action
  processDetailBase(orderDetail, repair) {
    // 当商品为未称重时，出库数修改时input默认为空
    let details = orderDetail.details
    details = _.map(details, (v) => {
      v.std_real_quantity_backup = v.std_real_quantity
      v.std_real_quantity_backup_2 = v.std_real_quantity
      // eslint-disable-next-line
      if (!window.g_clean_food && !v.weighted && !v.out_of_stock) {
        v.std_real_quantity = ''
        v.std_real_quantity_backup_2 = ''
      }
      if (globalStore.isHuaKang()) {
        v.after_sale_outstock_quantity = _.isNumber(
          v.after_sale_outstock_quantity,
        )
          ? v.after_sale_outstock_quantity
          : v.actual_quantity || null
        v.after_sale_outstock_quantity_fe = v.after_sale_quantity || null
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

    orderDetail.timeStart = timeStart
    orderDetail.timeEnd = timeEnd
    orderDetail.flagStart = flagStart
    orderDetail.flagEnd = flagEnd
    orderDetail.order_date = order_date
    orderDetail.repair = repair // 追加修改
    orderDetail.details = details
  }

  processDetail(repair) {
    const orderDetail = Object.assign({}, this.orderDetail)
    this.processDetailBase(orderDetail, repair)
    return orderDetail
  }

  // 时价
  @action
  listChangeTiming(index, data) {
    const orderDetail = this.orderDetail
    _.forEach(orderDetail.details, (v, i) => {
      if (+i === +index) {
        v.is_price_timing = data
      }
    })
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
      settlement_time,
      time_config_info,
      customized_field,
      receive_way,
      pick_up_st_id,
      customer,
    } = this.orderDetail
    const isLkOrder = isLK(_id)
    const receive_begin_time =
      moment(date_time).add(flagStart, 'd').format('YYYY-MM-DD') +
      ' ' +
      timeStart.format('HH:mm')
    const receive_end_time =
      moment(date_time).add(flagEnd, 'd').format('YYYY-MM-DD') +
      ' ' +
      timeEnd.format('HH:mm')

    if (
      moment(receive_begin_time, 'YYYY-MM-DD HH:mm:ss').isSameOrAfter(
        receive_end_time,
      )
    ) {
      Tip.warning(i18next.t('收货开始时间必须小于收货结束时间'))
      return Promise.reject(new Error('updateOrderErr'))
    }
    if (!customer?.address?.trim()) {
      Tip.warning(i18next.t('收货地址不能为空'))
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

    if (receive_way === 2 && !pick_up_st_id) {
      Tip.warning(i18next.t('自提点不能为空'))
      return Promise.reject(new Error('updateOrderErr'))
    }
    if (
      hasUnReceiveTimes(
        time_config_info.is_undelivery,
        time_config_info.undelivery_times,
        {
          receive_begin_time,
          receive_end_time,
        },
      )
    ) {
      Tip.warning(i18next.t('当前选择的收货时间包含不配送时间段，请重新选择'))
      return Promise.reject(new Error('createOrderErr'))
    }

    // 过滤空行
    const skuData = filterSkus(details)

    // 检查是否存在输入不正确的sku
    const inValidSku = this.getInValidSkus(skuData)

    if (inValidSku) {
      inValidSkuTip(inValidSku)
      return Promise.reject(new Error('updateOrderErr'))
    }
    const isQuantityPermission = globalStore.hasPermission('edit_real_quantity')

    const skus = getPostSkus(skuData, (params, sku) => {
      let quantity = sku.std_real_quantity
      if (globalStore.isHuaKang() && !isLkOrder) {
        params.self_acquisition_quantity = sku.self_acquisition_quantity || 0
        params.after_sale_quantity = sku.after_sale_outstock_quantity_fe || 0
      }
      if (_.keys(sku.detail_customized_field).length) {
        params.detail_customized_field = sku.detail_customized_field
      }
      // 净菜商品由于只能修改销售单位，因此需要转成基本单位
      if (sku.clean_food) {
        quantity = _.isNil(sku.real_quantity)
          ? ''
          : parseFloat(
              Big((sku.real_quantity || 0) * sku.sale_ratio).toFixed(2),
            )
      }

      // todo 订单修改:在出库数未改值的前提,后端返回的出库数为‘’, 首次修改为0时 +‘0’ === +‘’导致无法更新出库数.
      if (
        !isQuantityPermission ||
        quantity === '' ||
        quantity === null ||
        quantity === undefined ||
        +quantity === sku.std_real_quantity_backup_2
      ) {
        return params
      } else {
        return {
          ...params,
          std_real_quantity: quantity.toString(),
        }
      }
    })

    const data = {
      order_id: _id,
      combine_goods_map: JSON.stringify(getCombineGoodsMap(details)),
      details: JSON.stringify(skus),
      order_data: JSON.stringify({
        receive_begin_time,
        receive_end_time,
        receive_way: receive_way,
        address: receive_way === 2 ? customer.pickAddress : customer.address,
        pick_up_st_id,
        remark,
        customized_field: _.keys(customized_field).length
          ? customized_field
          : undefined,
      }),
      // 区分新旧ui
      is_duplicate_sku: 1,
      version,
    }

    if (globalStore.isHuaKang()) {
      data.settlement_time = settlement_time
        ? moment(settlement_time).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        : null
    }
    return Promise.resolve(data)
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
        const { rounding } = json.data
        rounding?.length && Tip.success(getRoundingText(rounding))

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
        this.get(_id)
      })
  }

  @action.bound
  skuUpload(postData) {
    return Request('/station/order/import')
      .data(postData)
      .post()
      .then((json) => {
        // 加入新增商品标识
        const data = _.map(json.data, (item) => {
          return {
            ...item,
            fake_quantity: null,
            isNewItem: true,
            // 备注强制转为string
            spu_remark: _.isNil(item.spu_remark)
              ? item.spu_remark
              : `${item.spu_remark}`,
          }
        })
        this.orderDetail.details = squeshQoutePriceList(data)
      })
  }

  @action
  customerSearch(search_text) {
    return Request('/station/order/customer/search')
      .data({ limit: 1000, search_text })
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
          pickAddress: '',
          username: customer.username,
          extender: {
            resname: `${customer.resname}`,
          },
          fee_type: customer.fee_type,
        }))

        // 首次搜索
        runInAction(() => {
          this.orderDetail.customers = list
        })
        return list
      })
  }

  @action.bound
  customerStatusRefesh(address_id) {
    this.orderDetail.isCustomerStatusChecking = true
    // json.data.type 含义:  0，正常；11，白名单；12，信用额度内；13，超额；14，欠款（当没授信的时候返回）; 15,冻结; 16,先款后货用户无法在此下单; 100,其他
    return Request('/station/check_unpay')
      .data({ address_id })
      .get()
      .then((json) => {
        const customer = {
          ...this.orderDetail.customer,
          msg: json.data.msg,
          customer_credit_type: json.data.type,
          customer_credit_info: json.data,
        }
        this.orderDetail.customer = customer
        this.orderDetail.isCustomerStatusChecking = false
        const CustomerValid = isCustomerValid(customer)
        this.orderDetail.time_config_info = CustomerValid
          ? this.orderDetail.time_config_info
          : null
        this.orderDetail.flagStart = CustomerValid
          ? this.orderDetail.flagStart
          : -1
        this.orderDetail.flagEnd = CustomerValid ? this.orderDetail.flagEnd : -1
      })
  }

  @action
  viewTypeChange(viewType, repair = false) {
    this.orderDetail.viewType = viewType
    this.orderDetail.repair = repair
  }

  @action
  serviceTimeChange(serviceTime, cleanDetails = true) {
    if (!serviceTime) {
      this.orderDetail.time_config_info = null
      return
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

    // 增加表格第一行提供选择
    const details = cleanDetails ? [] : this.orderDetail.details
    if (!details.length) {
      details.push(this.getInitItem())
    }
    this.orderDetail.timeStart = timesObj.timeStart
    this.orderDetail.timeEnd = timesObj.timeEnd
    this.orderDetail.flagStart = timesObj.flagStart
    this.orderDetail.flagEnd = timesObj.flagEnd
    this.orderDetail.time_config_info = serviceTime
    this.orderDetail.details = details
    this.orderDetail.order_date_time = this.orderDetail.repair
      ? `${moment().format('YYYY-MM-DD')} ${moment(
          serviceTime.order_time_limit.start,
          'HH:mm',
        ).format('HH:mm:ss')}`
      : ''
  }

  @action
  skusIdCheck(time_config_id, details) {
    const { customer } = this.orderDetail
    return Request('/station/order/sku/check')
      .data({
        time_config_id,
        address_id: +customer.address_id,
        sku_ids: JSON.stringify(_.map(details, (item) => item.id)),
      })
      .get()
      .then((json) => {
        const ids = []
        const maps = {}
        _.each(json.data.valid_skus, (item) => {
          ids.push(item.sku_id)
          maps[item.sku_id] = item.sale_price
        })
        return { ids, maps }
      })
  }

  @action
  customerSelect(customer, options = null) {
    this.orderDetail.fee_type = customer ? customer.fee_type : ''
    this.orderDetail.customer = customer
    this.orderDetail.serviceTimesLoading = !!customer
    this.orderDetail.serviceTimes = []
    if (!customer) {
      this.orderDetail.time_config_info = null
      this.orderDetail.details = []
      return
    }

    return Request('/station/order/service_time')
      .data({ address_id: customer.id })
      .get()
      .then(async (json) => {
        const { service_time, time, freight } = json.data
        const { time_config_info, details } = this.orderDetail

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

        const currentConfig = time_config_info
          ? _.find(service_time, (item) => item._id === time_config_info._id) ||
            null
          : null
        let checkResult = {
          ids: [],
          map: {},
        }
        const detailsMap = {}
        let currentDetails = []
        const skus = _.filter(details, (sku) => sku.id !== null)
        _.each(skus, (item) => {
          detailsMap[item.id] = item
        })
        if (currentConfig && skus.length) {
          checkResult = await this.skusIdCheck(currentConfig._id, skus)
        }
        if (checkResult.ids.length) {
          currentDetails = _.map(skus, (sku) => {
            delete sku.is_combine_goods
            delete sku.belongWith
            delete sku.isCombineGoodsTop
            delete sku.isCombineGoodsBottom
            return {
              ...sku,
              sale_price: checkResult.maps?.[sku.id],
            }
          }).filter((_) => _)
        }
        runInAction(() => {
          this.orderDetail.freight = freight
          this.orderDetail.serviceTimes = service_time
          this.orderDetail.currentTime = time
          this.orderDetail.details = currentDetails
          this.orderDetail.time_config_info = currentConfig
          this.orderDetail.serviceTimesLoading = false
        })
        if (options && options.time_config_id) {
          const target =
            _.find(
              service_time,
              (item) => item._id === options.time_config_id,
            ) || null
          target && this.serviceTimeChange(target, false)
          target && this.copyOrder(options.order_id)
          this.retCopyData()
        } else if (service_time.length >= 1 && currentConfig) {
          this.serviceTimeChange(currentConfig, false)
        } else if (service_time.length === 1) {
          // 如果只有一个运营时间，则默认选中
          this.serviceTimeChange(service_time[0])
        }
      })
  }

  @action
  getFreight(address_id) {
    return Request('/station/order/service_time')
      .data({ address_id })
      .get()
      .then((json) => {
        const { freight } = json.data
        runInAction(() => {
          this.orderDetail.freight = freight
        })
        return json
      })
  }

  @action
  // 获取商户上一次订单的备注
  getLastOrderRemark(address_id) {
    return Request('/station/order/last_order_remark')
      .data({ address_id })
      .get()
      .then((json) => {
        runInAction(() => {
          this.orderDetail.last_remark = json.data.last_remark
        })
      })
  }

  @action
  // 选中上一次订单的备注
  selectLastRemark(last_remark) {
    this.orderDetail.remark = last_remark
  }

  /**
   *
   * @param {num} index
   * @param {key, value} param eg.{key: 'quantity', value; 123}
   */
  @action
  skuUpdate(index, param) {
    // 多sku下单，普通商品下单数 / 单价 / 备注无需同步

    const { details } = this.orderDetail
    const sku = details[index]
    const params = {
      ...param,
      index,
      id: sku.id,
      belongWith: sku.belongWith,
    }

    // 当前是否下多sku -- 判断有组合商品，才走同步逻辑
    const hasCombineGoods =
      _.findIndex(details, (sku) => sku.is_combine_goods) !== -1 ||
      sku.is_combine_goods
    if (!hasCombineGoods) {
      sku[param.key] = param.value
      return
    }

    asyncSalePrice(params, details)
    asyncSpuRemarkAndCustomize(params, details)
    if (sku.is_combine_goods && sku.isCombineGoodsTop) {
      asyncQuantityAndFakeQuantity(params, details)
    }

    sku[param.key] = param.value
  }

  @action
  onRowChange = (index, key, value) => {
    const obj = { ...this.orderDetail.details[index], [key]: value }
    this.orderDetail.details[index] = obj
  }

  /**
   * 批量更新含税单价为后台返回的数据（四舍五入之前的）
   */
  @action
  onBatchUpdatePrice = () => {
    //
    const list = this.orderDetail.details.map((item) => {
      const { yx_price, rule_type, backup_sale_price } = item
      if (yx_price && rule_type) {
        const before_change_price_forsale = Big(backup_sale_price)
          .div(yx_price)
          .times(100)
          .toFixed(2)

        return {
          ...item,
          sale_price: item.backup_sale_price,
          before_change_price_forsale: Number(before_change_price_forsale),
        }
      }
      return {
        ...item,
        sale_price: item.backup_sale_price || '',
      }
    })

    this.orderDetail.details = [...list]
  }

  @action
  skuMove(sIndex, dIndex) {
    const details = this.orderDetail.details

    const [removed] = details.splice(sIndex, 1)
    details.splice(dIndex, 0, removed)
  }

  @action
  editableToggle(repair = false) {
    const orderDetail = this.orderDetail
    const { combine_goods_map, sort_skus } = orderDetail
    if (
      orderDetail.viewType === 'view' &&
      orderDetail.customer.receive_begin_time
    ) {
      this.processDetailBase(orderDetail, repair)
      let details = orderDetail.details
      if (this.orderDetail.detailsBeforeRank) {
        details = this.orderDetail.detailsBeforeRank
        this.orderDetail.detailsBeforeRank = null
      }
      // 从扁平化商品 -> 组合商品
      orderDetail.details = toCombineGoodsIfExist(
        details,
        combine_goods_map,
        sort_skus,
      )
      orderDetail.viewType = 'edit'
    } else {
      orderDetail.viewType = 'view'
      orderDetail.repair = false
    }
  }

  @action
  receiveChange(changed) {
    if (changed.receive_way === 1) {
      changed.pick_up_st_id = 0
    }
    this.orderDetail = { ...this.orderDetail, ...changed }
    // mapForChange(changed, this.orderDetail)
  }

  @action
  importChange(data) {
    this.orderListImport = Object.assign({}, this.orderListImport, data)
  }

  /**
   * @param {*} search_text
   * @param {*} usual_type 1: 常用商品列表 2： 一般sku搜索
   */
  @action
  getAddressSkus(search_text, usual_type) {
    const {
      customer,
      time_config_info,
      order_date_time,
      repair,
      viewType,
    } = this.orderDetail
    let req = {
      search_combine_goods: 1, // 搜索组合商品
      address_id: customer.address_id,
      offset: 0,
      limit: 10,
      search_text,
      fetch_category: 1,
      active: 1,
      time_config_id: time_config_info._id,
      usual_type,
    }

    // 如果开启复制至补单，并选择了历史报价，需要拉取对应商品的历史报价
    if (globalStore.orderSupplementPrice && repair && viewType === 'create') {
      const time = moment(order_date_time)
      req = Object.assign(req, {
        start_time: time.format('YYYY-MM-DD HH:mm:ss'),
        end_time: time.format('YYYY-MM-DD HH:mm:ss'),
      })
    }

    return Request('/station/skus/addr')
      .data(req)
      .get()
      .then((json) => {
        // 没有开启多sku时，直接进行同步, 若开启在添加商品时判断是否同步
        const { orderCanHaveDuplicateSku } = globalStore.orderInfo
        !orderCanHaveDuplicateSku &&
          asyncSkuInfo(json.data, this.orderDetail.details)

        // 常用商品搜索后，同步下商品的下单数信息, 展示该商品总下单数
        _.forEach(json.data, (item) => {
          if (usual_type === 1) {
            const _sku = _.find(this.skusQuantity, (s) => s.id === item.id)
            if (_sku) {
              item.quantity = _sku.totalQuantity
            }
          }

          if (orderCanHaveDuplicateSku) {
            // 多sku没有同步，需要处理一下备注问题 -- 订单备注默认是空，提供快速选择功能
            item._spu_remark = item.spu_remark
            item.spu_remark = ''
          }
        })

        return json.data
      })
  }

  /**
   * @description:复制订单
   * @param {boolean} isCopyOrderSyncGoodsPrice 复制订单是否同步商品单价
   */

  @action
  copyOrder(order_id, isCopyOrderSyncGoodsPrice) {
    if (!order_id) return
    const remark = this.copyData
      ? this.copyData.remark
      : this.orderDetail.remark
    const orderType = this.copyData
      ? this.copyData.orderType
      : this.orderDetail.orderType
    const customizedField = this.copyData?.customized_field || {}
    if (!isCopyOrderSyncGoodsPrice) {
      isCopyOrderSyncGoodsPrice = this.copyData?.isCopyOrderSyncGoodsPrice
    }
    const params = isCopyOrderSyncGoodsPrice
      ? { id: order_id, is_duplicate_sku: 1 }
      : { order_id, search_combine_goods: 1 }

    return Request(
      `/station/order/${isCopyOrderSyncGoodsPrice ? 'edit' : 'copy'}`,
    )
      .data(params)
      .get()
      .then((json) => {
        let skus = isCopyOrderSyncGoodsPrice ? json.data.details : json.data
        _.forEach(skus, (sku) => {
          sku.backup_sale_price = Big(sku.sale_price || 0).toString()
          sku.sale_price = Big(sku.sale_price || 0).toFixed(2)
        })

        const length = skus?.length
        skus = length ? skus : [this.getInitItem()]
        runInAction(() => {
          this.orderDetail.remark = remark || ''
          this.orderDetail.customized_field = customizedField
          this.orderDetail.orderType = orderType || '' // ''表示常规类型
          this.orderDetail.details = squeshQoutePriceList(
            dealCombineGoodsList(skus),
          )

          if (globalStore.orderSupplementPrice && this.orderDetail.repair) {
            return this.updateSkuPrice()
          }

          // 华康复制订单，备注不需要复制, 其他数据需要同步处理
          if (globalStore.isHuaKang()) {
            this.orderDetail.details = _.map(this.orderDetail.details, (d) => ({
              ...d,
              spu_remark: '',
              actual_quantity: d.quantity, // 验货数默认为下单数
              after_sale_outstock_quantity: d.quantity,
              self_acquisition_quantity: 0, // 自采数不复制
              after_sale_outstock_quantity_fe: 0, // 售后数不复制
            }))
          }
          return json
        })
      })
  }

  @action.bound
  search(value) {
    if (!value) {
      return Promise.resolve([])
    }
    return this.getAddressSkus(value, 2)
  }

  // 添加空行
  @action
  addNewItem(index) {
    const { details } = this.orderDetail
    const sku = details[index]
    let i = index
    // 组合商品需要加上商品个数
    if (sku && sku.is_combine_goods && sku.isCombineGoodsTop) {
      i = i + sku.skus.length
    }

    const item = this.getInitItem()

    if (index !== undefined) {
      details.splice(i + 1, 0, item)
    } else {
      details.push(item)
    }
  }

  // 删除一行
  @action
  deleteItem(index) {
    const { details } = this.orderDetail
    const item = this.getInitItem()
    if (details.length > 1) {
      const sku = details[index]
      if (sku.is_combine_goods) {
        deleteCombineGoods(index, details)
      } else {
        details.splice(index, 1)
      }
      // 都删完了
      if (details.length === 0) {
        details.push(item)
      }
    }
  }

  // 添加商品
  addSku(skus) {
    const { index, sku, details } = skus

    // 常用商品导入 or 智能识别 添加 index = null, 否则为table搜索添加
    if (index !== null) {
      mapForChange(sku, details[index])
    } else {
      // 常用商品导入 or 智能识别 添加 index = null
      // 当添加时列表只有空行，直接覆盖
      const isNull = _.find(details, (item) => item.id !== null)
      if (isNull === undefined) {
        details.splice(0, 1, sku)
      } else {
        details.unshift(sku)
      }
    }
  }

  // 同步组合商品销售价
  @action
  dealRecognitionList(list) {
    const detailsMap = {}
    _.each(this.orderDetail.details, (sku) => {
      if (sku.id) {
        detailsMap[sku.id] = { ...sku }
      }
    })
    _.each(list, (sku) => {
      const oldSku = detailsMap[sku.id]
      const belongWith = sku.belongWith || (oldSku && oldSku.belongWith)
      if (belongWith) {
        // 原料需要同步销售价
        asyncSalePrice(
          {
            key: 'sale_price',
            value: sku.sale_price,
            id: sku.id,
            belongWith,
          },
          this.orderDetail.details,
        )
      }
    })
  }

  /**
   * 常用商品 / 智能识别 / 搜索 -- 商品添加 / 修改
   * @param {*} index
   * @param {*} skus
   * @param {*} where 何处添加, 默认normal为table添加修改
   */
  @action
  orderSkusChange(index, skus, where = 'normal') {
    if (!skus.length) return
    const { details } = this.orderDetail
    // 铺平展开询价信息 && 同步下单数
    const newSkus = squeshQoutePriceList(
      _.map(skus, (item) => {
        const _quantity = item.sale_num || item.sale_num_least
        // 常用商品 / 智能识别可以重新设置下单数, 组合商品下单数有初始配置
        const quantity =
          where !== 'normal' || item.is_combine_goods
            ? item.quantity
            : _quantity
        return {
          ...item,
          detail_customized_field: item.detail_customized_field || {},
          actual_quantity: quantity,
          after_sale_outstock_quantity: quantity,
          after_sale_outstock_quantity_fe: null,
          self_acquisition_quantity: null,
          fake_quantity: null,
          isNewItem: true,
          quantity,
        }
      }),
    )

    // 智能识别可修改商品单价，以智能识别添加商品销售价为准，对已添加商品作同步
    if (where === 'recognition') {
      this.dealRecognitionList(newSkus)
    }

    if (newSkus.length > 1) {
      _.isNumber(index) && details.splice(index, 1, ...newSkus)
      _.isNil(index) && details.unshift(...newSkus)
    } else {
      // id为null, 删除商品，清空一行数据, 清空数据时需要把detail_id清掉（因为新增商品不需要带上detail_id)
      const sku = newSkus[0]
      if (sku.id === null) {
        mapForChange({ ...sku, detail_id: undefined }, details[index])
      } else {
        // 添加商品
        this.addSku({ index, sku, details, where })
      }
    }
  }

  // 订单商品价格同步至报价单
  @action
  orderSyncToSku(params) {
    return Request('/station/order/price_sync_to_sku')
      .data(params)
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('订单商品价格同步至报价单成功'))
        }
      })
  }

  // 配送单根据订单id生成token
  @action
  orderPrinterGetShareToken(id) {
    return Request('/station/distribute/share_token/get')
      .data({ order_id: id })
      .get()
  }

  // 更新商品的历史报价
  @action
  updateSkuPrice() {
    const { details, order_date_time } = this.orderDetail
    const sku_ids = _.map(details, (v) => v.id)
    const time = moment(order_date_time)
    const params = {
      sku_ids: JSON.stringify(sku_ids),
      start_time: time.format('YYYY-MM-DD HH:mm:ss'),
      end_time: time.format('YYYY-MM-DD HH:mm:ss'),
    }
    return Request('/product/sku_snapshot/prices')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.orderDetail.details = transformHistoryPrice(details, json.data)
          return json
        }),
      )
  }

  /**
   * 获取周转物总览
   */
  @action
  getTurnoverInfo(id) {
    const req = {
      start_date: '2020-12-30',
      end_date: ' 2021-01-06',
      order_id: id,
    }
    return Request('/station/turnover/loan_sheet/list')
      .data(req)
      .get()
      .then((json) => {
        this.turnover_data = json.data
      })
  }

  /**
   * 查询该订单是否已出库
   */
  @action
  checkHasOut(id) {
    return Request('/stock/out_stock_sheet/check_has_out').data({ id }).get()
  }
}

export default new Store()
