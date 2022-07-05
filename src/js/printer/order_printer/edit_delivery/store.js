import { action, computed, observable, reaction } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import moment from 'moment'
import { isSameSku, isInvalid, isHuaKangReq } from './util'
import _ from 'lodash'
import Big from 'big.js'
import { i18next } from 'gm-i18n'

import globalStore from 'stores/global'
class DeliveryStore {
  constructor() {
    // 重新汇总订单金额
    this.r = reaction(
      () =>
        this.skuList.reduce(
          (result, sku) => {
            // self_pick_quantity为定制字段，不一定会返回
            return {
              // total_pay: Big(result.total_pay).plus(sku.real_item_price), // 销售额 = 出库金额 + 异常汇总
              total_price: Big(result.total_price).plus(
                sku.sale_price * sku.quantity,
              ), // 下单金额
              real_price: Big(result.real_price).plus(sku.real_item_price), // 出库金额
              self_price: Big(result.self_price).plus(
                sku.sale_price * (sku.self_pick_quantity || 0),
              ), // 自采金额
              summary_price: Big(result.summary_price)
                .plus(sku.sale_price * sku.real_quantity)
                .plus(sku.sale_price * (sku.self_pick_quantity || 0)), // 汇总金额 =(假出库数+自采数)*销售单价
            }
          },
          {
            total_pay: 0,
            total_price: 0,
            real_price: 0,
            self_price: 0,
            summary_price: 0,
          },
        ),
      ({ total_pay, total_price, real_price, self_price, summary_price }) => {
        // const { extraMoney } = this.orderData
        // this.orderData.total_pay = total_pay.plus(extraMoney).toFixed(2)
        this.orderData.total_price = total_price.toFixed(2)
        this.orderData.real_price = real_price.toFixed(2)
        this.orderData.self_price = self_price.toFixed(2)
        this.orderData.summary_price = summary_price.toFixed(2)
      },
    )
  }

  /* 原始 */
  originalOrderData = {}

  // 原始订单数据
  originalSkuList = [] // 原始商品数据

  /* 用来编辑和展示的数据 */
  @observable orderData = {
    total_pay: 0,
    total_price: 0,
    real_price: 0,
    self_price: 0,
    summary_price: 0,
  }

  @observable skuList = []
  @observable sortSkuList = []

  @observable category_sort_type = null

  @observable order_id = ''

  @observable isLoading = false

  @observable step = 1

  @action saveId(order_id) {
    this.order_id = order_id
  }

  // 获取拖拽后的新数组
  @action.bound
  setSortSkuList(newData) {
    this.sortSkuList = newData
  }

  // 分类排序
  @action.bound
  setSkuList(data) {
    this.skuList = data
  }

  // 更新升序降序状态
  @action.bound
  setCategoryType(type) {
    this.category_sort_type = type
  }

  // 新建一张配送单,从订单详情接口取数据
  @action.bound
  async createDelivery(req) {
    await Request('/delivery/create').data(req).post()
    this.fetchData({ first: 1 })
  }

  @action.bound
  async fetchData(params) {
    this.isLoading = true

    const req = { order_id: this.order_id, type: 2, ...params }
    const data = await Request('/delivery/get')
      .data(req)
      .get()
      .then((json) => {
        // 兼容旧的数据，旧的数据sale_unit_name值可能是空的，为空的话，值和std_unit_name相同

        json.data &&
          (json.data.details = _.map(json.data.details, (item) => {
            if (!item.sale_unit_name) {
              item.sale_unit_name = item.std_unit_name
            }
            return item
          }))

        return json.data
      })

    if (!data) {
      this.step = 1 // 填写同步配置
    } else {
      this.stepTwo(data)
    }

    this.isLoading = false
    return true
  }

  @action.bound
  stepTwo(data) {
    this.step = 2
    const { details, ...orderData } = data
    // 展示数据
    const _orderData = this.processOrderData(orderData)
    this.orderData = { ...this.orderData, ..._orderData }

    // 因为后台不要real_quantity real_quantity_lock也不传过来所以依赖返回的real_weight_lock判断是否上锁
    details.forEach((item) => {
      item.real_quantity_lock = item.real_weight_lock
    })
    const skuListDetails = details.map((item) => {
      return {
        ...item,
        op_type: 2, // 编辑订单
      }
    })
    this.skuList = skuListDetails
    // 原始数据
    this.originalOrderData = _orderData
    this.originalSkuList = details
  }

  processOrderData(orderData) {
    const {
      receive_begin_time,
      receive_end_time,
      order_time,
      abnormal_money = 0,
      coupon_amount = 0,
      refund_money = 0,
    } = orderData

    // 各种异常金额优惠金额汇总,后面用这个重新计算销售额
    const extraMoney = Big(abnormal_money)
      .minus(coupon_amount)
      .plus(refund_money)
      .toFixed(2)
    return {
      ...orderData,
      extraMoney,
      receive_time: `${moment(receive_begin_time).format(
        'MM-DD HH:mm:ss',
      )} ~ ${moment(receive_end_time).format('MM-DD HH:mm:ss')}`,
      order_time: moment(order_time).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  @action.bound
  setOrderData(modify) {
    this.orderData = {
      ...this.orderData,
      ...modify,
    }
  }

  getNewSku(newSku = {}) {
    const initialSku = {
      id: '',
      name: '',
      category_title_1: '',
      sale_unit_name: '',
      std_unit_name: '',
      sale_ratio: '',
      quantity: '', // 下单数
      sale_price: '', // 单价_销售单位
      real_weight: '', // 出库数
      real_item_price: 0, // _出库金额
      type: 2, // type=2 假商品 (新增的都定为假商品,后台不做同步更新)
      op_type: 1, // op_type=1 新增
      self_pick_quantity: 0, // 自采数
      real_quantity: '', // 出库数
      sku_production_date: null, // 生产日期
      before_change_price_forsale: '',
      add_quantity_list: [
        { id: 0, val: 0, amount: 0, name: '加单数1' },
        { id: 1, val: 0, amount: 0, name: '加单数2' },
        { id: 2, val: 0, amount: 0, name: '加单数3' },
        { id: 3, val: 0, amount: 0, name: '加单数4' },
      ],
    }
    return { ...initialSku, ...newSku }
  }

  // 加单数总数
  _addVal(list) {
    return _.reduce(
      list,
      (prev, item) => {
        return prev + Number(item.val)
      },
      0,
    )
  }

  // 加单金额总数
  _addAmount(list) {
    return _.reduce(
      list,
      (prev, item) => {
        return prev + Number(item.amount)
      },
      0,
    )
  }

  // 套账下单金额 = （下单数 + 出库数1234）* 单价
  _getAccountTotalAmount() {
    return _.reduce(
      this.skuList,
      (prev, item) => {
        const trickNum = +item.quantity + this._addVal(item.add_quantity_list)
        return Number(prev) + Number(Big(+trickNum).times(+item.sale_price))
      },
      0,
    )
  }

  // 套账出库金额 = （出库数销售单位+加单数1234）* 单价
  // 出库数的销售单位 = 出库数的基本单位 / 商品规格
  _geAccountOutStockAmount() {
    return _.reduce(
      this.skuList,
      (prev, item) => {
        if (!item.sale_ratio) return 0
        const trickNum =
          Number(Big(+item.real_weight).div(+item.sale_ratio)).toFixed(2) +
          this._addVal(item.add_quantity_list)
        return (
          +Big(prev).toFixed(2) + Number(Big(+trickNum).times(+item.sale_price))
        )
      },
      0,
    )
  }

  // 总加单金额
  _getAccountAddQuantityAmount() {
    let accountAddQuantityAmount = 0
    _.forEach(this.skuList, (item) => {
      accountAddQuantityAmount += _.reduce(
        item.add_quantity_list,
        (prev, item) => {
          return Number(prev) + Number(item.amount)
        },
        0,
      )
    })
    return accountAddQuantityAmount
  }

  // 销售额（不含运费）= 出库金额 + 加单金额
  _getTotalPay() {
    // 加单金额
    const accountAddQuantityAmount = this._getAccountAddQuantityAmount()
    return (
      accountAddQuantityAmount +
      _.reduce(
        // 出库金额总和
        this.skuList,
        (prev, item) => {
          return Number(prev) + Number(item.real_item_price)
        },
        0,
      ) +
      Number(this.orderData.extraMoney)
    )
  }

  // sku套账下单总数 = 下单数+加单数1，2，3，4
  _getSkuAccountQuantity(index) {
    this.skuList[index].sku_account_quantity =
      this._addVal(this.skuList[index].add_quantity_list) +
      Number(this.skuList[index].quantity)
  }

  //  sku套账出库总数(销售单位) = 出库数(销售单位) + 加单数1，2，3，4
  _getSkuAccountOutstockQuantity(index) {
    this.skuList[index].sku_account_outstock_quantity =
      this._addVal(this.skuList[index].add_quantity_list) +
      Number(
        Big(+this.skuList[index].real_weight).div(
          +this.skuList[index].sale_ratio,
        ),
      )
  }

  // sku套账下单金额= 单价 * 下单数 + 加单数
  _getSkuAccountAmount(index) {
    const num =
      this._addVal(this.skuList[index].add_quantity_list) +
      Number(this.skuList[index].quantity)
    this.skuList[index].sku_account_amount = Number(
      Big(this.skuList[index].sale_price).times(num),
    )
  }

  // sku套账出库金额=加单金额+出库金额
  _getSkuAccountOutstockAmount(index) {
    this.skuList[index].sku_account_outstock_amount =
      Number(this.skuList[index].real_item_price) +
      this._addAmount(this.skuList[index].add_quantity_list)
  }

  // sku总加单金额
  _getAddQuantityAmount(index) {
    this.skuList[index].add_quantity_amount = this._addAmount(
      this.skuList[index].add_quantity_list,
    )
  }

  // 设置加单数和加单金额
  @action.bound
  setSkuListAddQuantityList(index, addQuantityIndex, type, value) {
    const sku = { ...this.skuList[index] }
    const { add_quantity_list } = sku
    add_quantity_list[addQuantityIndex].val = value

    // 重新计算加单金额
    add_quantity_list[addQuantityIndex].amount = +Big(+value)
      .times(+sku.sale_price)
      .toFixed(2)

    this.skuList[index] = { ...sku }
    // 套账下单金额
    this.orderData.account_total_amount = this._getAccountTotalAmount()
    // 套账出库金额
    this.orderData.account_outstock_amount = this._geAccountOutStockAmount()
    // 总加单金额
    this.orderData.account_add_quantity_amount = this._getAccountAddQuantityAmount()
    // 销售额（不含运费）
    this.orderData.total_pay = this._getTotalPay()
    // sku套账下单总数
    this._getSkuAccountQuantity(index)
    // sku套账出库总数(销售单位)
    this._getSkuAccountOutstockQuantity(index)
    // sku套账下单金额=加单金额+下单金额
    this._getSkuAccountAmount(index)
    // sku套账出库金额
    this._getSkuAccountOutstockAmount(index)
    // sku总加单金额
    this._getAddQuantityAmount(index)
  }

  @action.bound
  setSkuListItem(index, modifySku) {
    const sku = { ...this.skuList[index], ...modifySku }
    // 商品出库(基本单位)金额重新计算
    const {
      real_weight,
      sale_ratio,
      sale_price,
      real_quantity,
      add_quantity_list,
    } = sku
    if (real_weight === '' || +sale_price === 0 || +sale_ratio === 0) {
      sku.real_item_price = 0
    } else {
      const num = Big(real_weight || 0)
        .div(sale_ratio || 1)
        .toFixed(2)
      sku.real_item_price = Big(num).mul(sale_price).toFixed(2)
    }
    // 华康定制
    if (globalStore.isHuaKang()) {
      // 商品出库(销售单位)金额重新计算
      if (real_quantity === '' || +sale_price === 0 || +sale_ratio === 0) {
        sku.real_item_price = 0
        sku.real_weight = 0
      } else {
        sku.real_item_price = (real_quantity * sale_price).toFixed(2)
        sku.real_weight = real_quantity * sale_ratio
      }
    }
    // 自采金额重新计算
    const { self_pick_quantity } = sku
    if (self_pick_quantity === '' || !sale_price) {
      sku.self_item_price = 0
    } else {
      sku.self_item_price = Big(self_pick_quantity || 0)
        .times(sale_price || 0)
        .toFixed(2)
    }
    // 加单金额
    sku.add_quantity_list = _.map(add_quantity_list, (item, index) => {
      return {
        ...item,
        amount: +Big(+item.val)
          .times(+sale_price)
          .toFixed(2),
      }
    })

    this.skuList[index] = { ...sku }
    // 套账下单金额
    this.orderData.account_total_amount = this._getAccountTotalAmount()
    // 套账出库金额
    this.orderData.account_outstock_amount = this._geAccountOutStockAmount()
    // 总加单金额
    this.orderData.account_add_quantity_amount = this._getAccountAddQuantityAmount()
    // 销售额（不含运费）
    this.orderData.total_pay = this._getTotalPay()
    // sku套账下单总数
    this._getSkuAccountQuantity(index)
    // sku套账出库总数(销售单位)
    this._getSkuAccountOutstockQuantity(index)
    // sku套账下单金额=加单金额+下单金额
    this._getSkuAccountAmount(index)
    // sku套账出库金额
    this._getSkuAccountOutstockAmount(index)
    // sku总加单金额
    this._getAddQuantityAmount(index)
  }

  @action.bound
  deleteSkuListItem(index) {
    if (this.skuList.length === 1) {
      Tip.info(i18next.t('至少保留一个商品'))
    } else {
      this.skuList.splice(index, 1)
      // 套账下单金额
      this.orderData.account_total_amount = this._getAccountTotalAmount()
      // 套账出库金额
      this.orderData.account_outstock_amount = this._geAccountOutStockAmount()
      // 总加单金额
      this.orderData.account_add_quantity_amount = this._getAccountAddQuantityAmount()
    }
  }

  // 修改顺序前判断数据中的必填字段都填写
  @action.bound
  sortingListsTrim() {
    let flag = true
    _.forEach(this.skuList, (item) => {
      const sortListItem = this._getSortListField(item)
      for (const value of _.values(sortListItem)) {
        if (isInvalid(value)) {
          Tip.danger(i18next.t('必填字段不能为空'))
          flag = false
          break
        }
      }
    })
    return flag
  }

  @action.bound
  addSkuListItem(index) {
    // 新添加的商品的detail_id为0
    this.skuList.splice(index + 1, 0, this.getNewSku({ detail_id: 0 }))
  }

  @action.bound
  skuListItemChange(index, skuFormXHR) {
    const newSku = _.pick(skuFormXHR, [
      'id',
      'name',
      'category_title_1',
      'sale_unit_name',
      'std_unit_name',
      'sale_ratio',
      'sale_price',
    ])
    this.skuList[index] = this.getNewSku(newSku)
  }

  /* 用于diff和传给后台的字段 */
  @computed
  get _orderDataModify() {
    return [
      'freight',
      'freight_lock',
      ...globalStore.customizedInfoConfigs?.map((item) => item.id),
    ]
  }

  // 商品
  /* 返回必传字段 */
  _getNecessaryField(op_type, sku) {
    return {
      id: sku.id,
      type: sku.type,
      raw_id: sku.raw_id,
      detail_id: sku.detail_id,
      op_type, // 1新增操作 2 编辑操作 3 删除操作
      sku_production_date: sku.sku_production_date,
      before_change_price_forsale: sku.before_change_price_forsale,
      spu_remark: sku.spu_remark,
    }
  }

  // 必传字段
  _getSortListField(sku) {
    return {
      id: sku.id, // 商品id
      type: sku.type, // 类型
      name: sku.name, // 商品名称
      quantity: sku.quantity, // 下单数
      category_title_1: sku.category_title_1, // 商品分类
      sale_unit_name: sku.sale_unit_name, // 商品规格1
      std_unit_name: sku.std_unit_name, //  商品规格2
      sale_ratio: sku.sale_ratio, //  商品规格3
      real_weight: sku.real_weight, // 出库数(基本单位)
      sale_price: sku.sale_price, // 单价(销售单位)
      real_item_price: sku.real_item_price, // 出库金额
    }
  }

  // 非表格的必传字段（运费以及自定义字段）
  _getOrderData() {
    const orderData = {}
    const customized_field = {}
    const customized_field_lock = {}
    // 判断是否有开启同步自定义字段
    const orderDataModify = this.orderData.sync_customized_field
      ? this._orderDataModify
      : ['freight', 'freight_lock']
    for (const key of orderDataModify) {
      if (['freight', 'freight_lock'].includes(key)) {
        const value = this.orderData[key]
        if (value !== this.originalOrderData[key]) {
          if (isInvalid(value)) {
            Tip.danger(i18next.t('必填字段不能为空'))
            throw new Error('必填字段不能为空')
          } else {
            orderData[key] = value
          }
        }
      } else {
        const value = this.orderData.customized_field[key]
        const lockStatus = this.orderData.customized_field_lock[key]
        if (value !== this.originalOrderData.customized_field[key]) {
          if (isInvalid(value)) {
            Tip.danger(i18next.t('必填字段不能为空'))
            throw new Error('必填字段不能为空')
          } else {
            customized_field[key] = value
          }
        } else {
          customized_field[key] = value
        }
        customized_field_lock[key] = lockStatus
      }
    }

    return _.isEmpty(customized_field) && _.isEmpty(customized_field_lock)
      ? orderData
      : {
          ...orderData,
          customized_field: JSON.stringify(customized_field),
          customized_field_lock: JSON.stringify(customized_field_lock),
        }
  }

  // 将加单金额和加单数转化为number类型
  _transformNumber(list) {
    return _.map(list, (item) => {
      return {
        ...item,
        real_item_price: +item.real_item_price,
        quantity: +item.quantity,
        before_change_price_forsale: +item.before_change_price_forsale,
        add_quantity_list: _.map(item.add_quantity_list, (v) => {
          return {
            ...v,
            val: +v.val,
            amount: +v.amount,
          }
        }),
      }
    })
  }

  // 重新计算total_item_price字段的值
  _calcTotalItemPrice(list) {
    return _.map(list, (item) => {
      if (item.op_type === 2) {
        return {
          ...item,
          total_item_price: Number(Big(item.sale_price).times(item.quantity)),
        }
      }
      return item
    })
  }

  // 去除多余的字段
  _takeOutSurplusField(list) {
    return _.map(list, (item) => {
      return _.omit(item, [
        'outstock_quantity',
        'rule_type',
        'yx_price',
        'sku_type',
        'add_quantity_amount',
        'order_quantity',
        'order_sale_price',
        'order_total_price',
        'real_quantity_lock',
        'self_item_price',
        'sku_account_amount',
        'sku_account_quantity',
        'sku_account_outstock_quantity',
        'sku_account_outstock_amount',
        'add_quantity_amount',
      ])
    })
  }

  @action.bound
  saveDelivery() {
    // 运费以及header的自定义字段
    const orderData = this._getOrderData()
    // 必填字段不能为空
    if (!this.sortingListsTrim()) return

    // 找出被删除的商品
    this.originalSkuList.forEach((sku) => {
      if (!_.find(this.skuList, (o) => isSameSku(o, sku))) {
        const deleteSku = this._getNecessaryField(3, sku)
        this.skuList.push(deleteSku)
      }
    })
    this.skuList = this._calcTotalItemPrice(this.skuList)
    // 华康定制需求 后台要求不传real_quantity real_quantity_lock，把real_quantity_lock值给到real_weight_lock
    if (globalStore.isHuaKang()) {
      isHuaKangReq(this.skuList)
    }
    // 去掉多余的字段
    this.skuList = this._takeOutSurplusField(this.skuList)
    // 类型转换
    this.skuList = this._transformNumber(this.skuList)
    const req = {
      ...orderData,
      details: JSON.stringify(this.skuList.slice()),
      delivery_id: this.orderData.delivery_id,
    }
    return Request('/delivery/update')
      .data(req)
      .post()
      .then((json) => {
        return this.fetchData()
      })
  }

  // 拖拽后改变顺序保存
  @action.bound
  saveSortingList() {
    // 运费
    const orderData = this._getOrderData()

    // 用户没有拖拽的时候this.sortSkuList的值是空，使用skuList传递过去
    let sortSkuList =
      this.sortSkuList.length === 0 ? this.skuList.slice() : this.sortSkuList
    sortSkuList = this._calcTotalItemPrice(sortSkuList)
    // 找出被删除的商品
    this.originalSkuList.forEach((sku) => {
      if (!_.find(sortSkuList, (o) => isSameSku(o, sku))) {
        const deleteSku = this._getNecessaryField(3, sku)
        sortSkuList.push(deleteSku)
      }
    })
    // 华康定制需求 后台要求不传real_quantity real_quantity_lock，把real_quantity_lock值给到real_weight_lock
    if (globalStore.isHuaKang()) {
      isHuaKangReq(sortSkuList)
    }
    // 去掉多余的字段
    sortSkuList = this._takeOutSurplusField(sortSkuList)
    // 类型转换
    sortSkuList = this._transformNumber(sortSkuList)
    const req = {
      ...orderData,
      details: JSON.stringify(sortSkuList),
      delivery_id: this.orderData.delivery_id,
    }
    return Request('/delivery/update')
      .data(req)
      .post()
      .then((json) => {
        return this.fetchData()
      })
  }
}

export default new DeliveryStore()
