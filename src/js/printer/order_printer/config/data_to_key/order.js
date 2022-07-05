import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { MULTI_SUFFIX, MULTI_SUFFIX3 } from 'gm-printer'
import { i18next } from 'gm-i18n'
import {
  coverDigit2Uppercase,
  price,
  convertNumber2Sid,
  combineType,
  weekMap,
} from './util'
import { findReceiveWayById } from 'common/filter'
import { renderOrderTypeName } from 'common/deal_order_process'
import globalStore from 'stores/global'
import { getFiledData } from '../../../../common/components/customize'

const SETTLE_WAY = {
  1: '先货后款',
  2: '先款后货',
}

const PAY_STATUS = {
  1: '未支付',
  5: '部分支付',
  10: '已支付',
}

const PAY_METHOD = {
  1: '日结',
  2: '周结',
  3: '月结',
  4: '自定义结算',
}

/**
 * 根据原价及现价计算变化率
 * @param {number} prevPrice 原价
 * @param {number} nextPrice 现价
 * @param {number} yxPrice
 * @param {number} ruleObjectType ruleObjectType===3时 ChangeRate取yxPrice
 */
const getChangeRate = (prevPrice, nextPrice, yxPrice, ruleObjectType) => {
  if (!prevPrice || !nextPrice) return 0
  if (prevPrice === '0.00') return ''
  const changeRate =
    ruleObjectType === 3
      ? Big(yxPrice || 0).div(100)
      : Big(nextPrice).div(prevPrice)
  return globalStore?.orderInfo?.contract_rate_format === 1
    ? `${Big(changeRate - 1)
        .times(100)
        .toFixed(2)}%`
    : Big(changeRate).toFixed(2)
}

/**
 * 生成双栏商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMultiData(list, categoryTotal) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:2}, {a:3, a#2: 4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length

  while (index < len) {
    const sku1 = skuGroup[index]
    const sku2 = {}
    _.each(skuGroup[1 + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 2
  }

  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

/**
 * 生成三栏商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMulti3Data(list, categoryTotal) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}, {a: 5}, {a: 6}], 转化为 [{a:1, a#2:2, a#3:3}, {a:4, a#2:5 a#3:6}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length

  while (index < len) {
    const sku1 = skuGroup[index]
    const sku2 = {}
    const sku3 = {}

    _.each(skuGroup[1 + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })
    _.each(skuGroup[2 + index], (val, key) => {
      sku2[key + MULTI_SUFFIX3] = val
    })
    multiList.push({
      ...sku1,
      ...sku2,
      ...sku3,
    })

    index += 3
  }

  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

/**
 * 生成 双栏+纵向 双栏+分类+纵向 商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMultiData2(list, categoryTotal) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:3}, {a:2, a#2: 4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length
  const middle = Math.ceil(len / 2)

  while (index < middle) {
    const sku1 = skuGroup[index]
    const sku2 = {}
    _.each(skuGroup[middle + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 1
  }

  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

/**
 * 生成 三栏+纵向 三栏+分类+纵向 商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMulti3Data2(list, categoryTotal) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}, {a: 5}, {a: 6}], 转化为 [{a:1, a#2:3, a#3:5}, {a:2, a#2:4 a#3:6}]
  const skuGroup = [...list]

  let index = 0
  const len = skuGroup.length
  const middle = Math.ceil(len / 3)
  const splitList = []
  // 整理成 splitList   ==== [[{}...],[[{}...],[[{}...]]
  while (index < Math.ceil(len / middle)) {
    splitList.push(skuGroup.splice(0, middle))
    index++
  }
  let sku1 = []
  const sku2 = []
  const sku3 = []

  // splitList[0] 保持不变
  // splitList[1]里的对象所有的key添加 MULTI_SUFFIX
  // splitList[2]里的对象添加 MULTI_SUFFIX3
  _.forEach(splitList, (item, index) => {
    if (index === 0) {
      sku1 = item
    }
    if (index === 1) {
      const skuList = []
      _.each(item, (i, ind) => {
        _.each(i, (val, key) => {
          skuList[key + MULTI_SUFFIX] = val
        })
        sku2.push({ ...skuList })
      })
    }
    if (index === 2) {
      const skuList = []
      _.each(item, (i, ind) => {
        _.each(i, (val, key) => {
          skuList[key + MULTI_SUFFIX3] = val
        })
        sku3.push({ ...skuList })
      })
    }
  })
  // 整理成 [ { 序号:1, 序号_MULTI_SUFFIX:x, 序号_MULTI_SUFFIX3:x } ,{...}]
  _.forEach(sku1, (item, index) => {
    multiList.push({ ...sku1[index], ...sku2[index], ...sku3[index] })
  })

  // 添加上分类
  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

function getOrgItemPrice(list) {
  let totalOrgItemPrice = Big(0)
  _.each(list, (v) => {
    totalOrgItemPrice = totalOrgItemPrice.plus(Big(v.org_item_price).toFixed(2))
  })
  return totalOrgItemPrice
}

// 非表格数据
function generateCommon(data, mergeDeliveryType) {
  const combine_goods_num =
    (data?.combine_goods && data?.combine_goods[0]?.quantity) || 1
  const infoConfigs = globalStore.customizedInfoConfigs.filter(
    (v) => v.permission.read_station_delivery,
  )
  const map = {}
  const customizedField = data?.customized_field || {}
  infoConfigs.forEach((v) => {
    map[`自定义_${v.id}`] = getFiledData(v, customizedField)
  })

  const getOrderIds = () => {
    return data?.order_ids?.length > 4
      ? `${data?.order_ids?.splice(0, 4).toString()}...`
      : data?.order_ids?.toString()
  }

  return {
    ...map,
    barcode: data.id,
    qrcode: `https://miniapp.guanmai.cn/traceability/?id=${data.order_security_code}`, // 溯源二维码
    signature_image_url: data.signature_image_url, // 手写签名

    账户名: data.username,
    // 订单号: mergeDeliveryType === '1' ? data?.order_ids?.toString() : data.id,
    订单号: mergeDeliveryType === '1' ? getOrderIds() : data.id,
    分拣序号: `${data.sort_id || '-'} ${data.child_sort_id || '-'}`,
    支付状态: PAY_STATUS[data.pay_status],
    订单类型: renderOrderTypeName(data.order_process_name),

    下单时间: moment(data.date_time).format('YYYY-MM-DD HH:mm:ss'),
    下单时间_日期: moment(data.date_time).format('YYYY-MM-DD'),
    下单时间_时间: moment(data.date_time).format('HH:mm:ss'),
    下单时间_无年份: moment(data.date_time).format('MM-DD HH:mm:ss'),
    下单时间_日期_无年份: moment(data.date_time).format('MM-DD'),
    配送时间: `${moment(data.receive_begin_time).format(
      'YYYY-MM-DD HH:mm:ss',
    )} ~ ${moment(data.receive_end_time).format('YYYY-MM-DD HH:mm:ss')}`,
    配送时间_日期: `${moment(data.receive_begin_time).format(
      'YYYY-MM-DD',
    )} ~ ${moment(data.receive_end_time).format('YYYY-MM-DD')}`,
    配送时间_时间: `${moment(data.receive_begin_time).format(
      'HH:mm:ss',
    )} ~ ${moment(data.receive_end_time).format('HH:mm:ss')}`,
    配送时间_无年份: `${moment(data.receive_begin_time).format(
      'MM-DD HH:mm:ss',
    )} ~ ${moment(data.receive_end_time).format('MM-DD HH:mm:ss')}`,
    配送时间_日期_无年份: `${moment(data.receive_begin_time).format(
      'MM-DD',
    )} ~ ${moment(data.receive_end_time).format('MM-DD')}`,
    当前时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    当前时间_日期: moment().format('YYYY-MM-DD'),
    当前时间_时间: moment().format('HH:mm:ss'),
    当前时间_无年份: moment().format('MM-DD HH:mm:ss'),
    当前时间_日期_无年份: moment().format('MM-DD'),
    订单备注: data.remark,
    收货时间: `${moment(data.receive_begin_time).format(
      'YYYY-MM-DD HH:mm',
    )} ~ ${moment(data.receive_end_time).format('YYYY-MM-DD HH:mm')}`,
    收货时间_日期: `${moment(data.receive_begin_time).format(
      'YYYY-MM-DD',
    )} ~ ${moment(data.receive_end_time).format('YYYY-MM-DD')}`,
    收货时间_时间: `${moment(data.receive_begin_time).format(
      'HH:mm:ss',
    )} ~ ${moment(data.receive_end_time).format('HH:mm:ss')}`,
    收货时间_无年份: `${moment(data.receive_begin_time).format(
      'MM-DD HH:mm:ss',
    )} ~ ${moment(data.receive_end_time).format('MM-DD HH:mm:ss')}`,
    收货时间_日期_无年份: `${moment(data.receive_begin_time).format(
      'MM-DD',
    )} ~ ${moment(data.receive_end_time).format('MM-DD')}`,
    收货日期_星期: weekMap[moment(data.receive_begin_time).format('E')],
    结款周期: PAY_METHOD[data.pay_method.pay_method] || '',
    授信额度: price(data.credit_limit),
    箱数: data.order_box_count,
    下单金额: price(data.total_price),
    优惠金额: price(data.coupon_amount),
    折扣金额: price(data.all_discount_price),
    原销售额: price(data.before_change_total_pay),
    出库金额: price(data.real_price),
    运费: price(data.freight),
    异常金额: price(Big(data.abnormal_money).plus(data.refund_money)),
    销售额_含运税: price(data.total_pay),
    定制_自采金额: price(data.total_self_pick_money),
    定制_汇总金额: price(data.total_money),

    税额: price(data.total_tax), // 商品税额加总

    商户公司: data.cname,
    承运商: data.carrier,
    结款方式: SETTLE_WAY[data.settle_way],

    线路: data.address_route_name || '-',
    城市: data.city || '-',
    城区: data.area_l1 || '-',
    街道: data.area_l2 || '-',

    司机名称: data.driver_name || '-',
    司机电话: data.driver_phone || '-',
    车牌号码: data.plate_number || '-',
    车型: data.car_model || '-',
    满载框数: data.max_load || '-',
    销售经理: data.sale_manager.name || '-',
    销售经理电话: data.sale_manager.phone || '-',
    订单溯源码: data.order_security_code || '-',
    分拣重点关注: data.address_focus_on === 0 ? '正常' : '重点',

    // 收货人信息
    收货商户: data.resname,
    商户自定义编码: data.res_custom_code,
    商户ID: convertNumber2Sid(data.sid),
    收货人: data.receiver_name,
    收货人电话: data.receiver_phone,
    收货地址: data.address,

    下单账号: data.username,
    打印人: data.printer_operator,
    下单员: data.create_user,
    收货方式: findReceiveWayById(data.receive_way),
    自提点名称: data.pick_up_st_name,
    自提点负责人: data.pick_up_st_principal,
    自提点联系方式: data.pick_up_st_phone,
    社区店名称: data.community_name,
    团长姓名: data.distributor_name,
    团长账户: data.distributor_username,
    团长地址: data.distributor_address,
    团长电话: data.distributor_phone,
    分仓客户编号: convertNumber2Sid(data.real_address_id),
    分仓客户名称: data.real_resname,
    套餐价: Big(data.total_pay || 0)
      .div(combine_goods_num)
      .toFixed(2),
    实际下单金额: data?.order_total_amount ?? '-',
    套账下单金额: data?.account_total_amount ?? '-',
    套账出库金额: data?.account_outstock_amount ?? '-',
    总加单金额: data?.account_add_quantity_amount ?? '-',
    商户自定义字段1: data?.tenant_custom_field_1 ?? '-',
    商户自定义字段2: data?.tenant_custom_field_2 ?? '-',
    商户自定义字段3: data?.tenant_custom_field_3 ?? '-',
  }
}

// 大写金额数据
function generateUpperPrice(data, totalOrgItemPrice) {
  return {
    下单金额_大写: coverDigit2Uppercase(data.total_price),
    优惠金额_大写: coverDigit2Uppercase(data.coupon_amount),
    出库金额_大写: coverDigit2Uppercase(data.real_price),
    运费_大写: coverDigit2Uppercase(data.freight),
    异常金额_大写: coverDigit2Uppercase(
      Big(data.abnormal_money).plus(data.refund_money),
    ),
    销售额_含运税_大写: coverDigit2Uppercase(price(data.total_pay)),

    商品税额_大写: coverDigit2Uppercase(data.total_tax), // 商品税额加总

    // 原总金额
    原总金额_大写: coverDigit2Uppercase(totalOrgItemPrice),

    原销售额_大写: coverDigit2Uppercase(data.before_change_total_pay),

    折扣金额_大写: coverDigit2Uppercase(data.all_discount_price),
  }
}

// 商品统计数据(一些汇总之类的数据)
function generateSummary(list) {
  let quantityTotal = Big(0)
  let realWeightSaleUnitTotal = Big(0)
  _.each(list, (v) => {
    quantityTotal = quantityTotal.plus(v.quantity || 0)

    const realWeightSaleUnit = Big(v.real_weight || 0).div(v.sale_ratio)
    realWeightSaleUnitTotal = realWeightSaleUnitTotal.plus(realWeightSaleUnit)
  })
  // 😂前方高能.  汇总是什么鬼.每个商品的单位很可能不一样! 😇👍但是客户想要!因为他只卖猪肉!单位都一致🤢
  return {
    下单总数_销售单位: parseFloat(quantityTotal.toFixed(2)),
    出库总数_销售单位: parseFloat(realWeightSaleUnitTotal.toFixed(2)),
  }
}

/**
 * 获取售后汇总和明细数据
 * @param {object} data 含exception,refund,no_sku_exceptions的data
 * @return {object: {totalData,exception,refund,no_sku_exceptions,}}
 */
function getExceptionAndRefund(data) {
  const totalData = {
    exception: {},
    refund: {},
    no_sku_exceptions: [],
  }
  const exception = {}
  const refund = {}
  const no_sku_exceptions = []

  // 商品异常
  if (data.exception_new) {
    for (const [key, value] of Object.entries(data.exception_new)) {
      let totalNum = 0
      let totalMoney = 0
      _.each(value, (item) => {
        /** 处理明细 */
        if (!exception[key]) {
          exception[key] = []
        }

        exception[key].push({
          异常原因: item.exception_reason_text,
          异常描述: item.text,
          异常数量: item.amount_delta,
          异常金额: price(item.money_delta),
          售后类型: '商品异常',
          abnormalNumber: item.amount_delta,
          _origin: item,
        })

        /** 处理汇总 */
        if (!totalData.exception[key]) {
          totalData.exception[key] = [{ _origin: item }]
        }

        if (value.length > 1) {
          Object.assign(totalData.exception[key][0], {
            异常原因: '-',
            异常描述: '-',
            售后类型: '商品异常',
          })
        } else if (value.length === 1) {
          Object.assign(totalData.exception[key][0], exception[key][0]) // 取第一条数据就好
        }
        totalNum = +Big(item.amount_delta).plus(totalNum)
        totalMoney = +Big(item.money_delta).plus(totalMoney)
      })

      Object.assign(totalData.exception[key][0], {
        异常数量: totalNum,
        异常金额: price(totalMoney),
        abnormalNumber: totalNum,
      })
    }
  }

  // 非商品异常
  if (data.no_sku_exceptions) {
    _.each(data.no_sku_exceptions, (value) => {
      no_sku_exceptions.push({
        异常原因: value.exception_reason_text,
        异常描述: value.text,
        异常数量: '-',
        异常金额: price(value.money_delta),
        售后类型: '非商品异常',
        _origin: value,
      })
      totalData.no_sku_exceptions.push({
        异常原因: value.exception_reason_text,
        异常描述: value.text,
        异常数量: '-',
        异常金额: price(value.money_delta),
        售后类型: '非商品异常',
        _origin: value,
      })
    })
  }
  // 退货
  if (data.refund_new) {
    for (const [key, value] of Object.entries(data.refund_new)) {
      let totalNum = 0
      let totalMoney = 0
      _.each(value, (item) => {
        /** 处理明细 */
        if (!refund[key]) {
          refund[key] = []
        }

        refund[key].push({
          异常原因: item.exception_reason_text,
          异常描述: item.text,
          异常数量: item.amount_delta,
          异常金额: price(item.money_delta),
          售后类型: '退货',
          refundNumber: item.amount_delta,
          _origin: item,
        })

        /** 处理汇总 */
        if (!totalData.refund[key]) {
          totalData.refund[key] = [{ _origin: item }]
        }

        if (value.length > 1) {
          Object.assign(totalData.refund[key][0], {
            异常原因: '-',
            异常描述: '-',
            售后类型: '退货',
          })
        } else if (value.length === 1) {
          Object.assign(totalData.refund[key][0], refund[key][0]) // 取第一条数据就好
        }
        totalNum = +Big(item.amount_delta).plus(totalNum)
        totalMoney = +Big(item.money_delta).plus(totalMoney)
      })
      Object.assign(totalData.refund[key][0], {
        异常数量: totalNum,
        异常金额: price(totalMoney),
        refundNumber: totalNum,
      })
    }
  }

  return {
    totalData,
    exception,
    refund,
    no_sku_exceptions,
  }
}

// 普通订单数据，处理商品异常、退货、非商品异常的汇总数据
// sid合并打印，根据异常的数据进行计算的实际金额，实际出库数，实际出库数_销售单位是后端返回，不需要计算
function generateOrderData(
  list,
  data,
  mergeDeliveryType,
  specialConfig = 'noSpecail',
) {
  const {
    totalData: { exception, refund },
  } = getExceptionAndRefund(data)
  // 合并sid的异常商品+退货商品  对象集合
  const abnormalSIDObject = {}
  // 异常商品+退货商品  对象集合
  const abnormalObject = Object.assign({}, exception, refund)
  return _.map(list, (v, index) => {
    // 异常或者退货
    const _detail_id = v.detail_id === undefined ? '' : v.detail_id

    // 合并sid时，后端不反回detail_id
    for (const [key, value] of Object.entries(abnormalObject)) {
      const newKey = key.split('_')[0]
      abnormalSIDObject[newKey] = value
    }
    /** 由于后台原因，售后相关接口中detail_id为sku_id， 多sku通过order_detail_id来区分相同id
     * 旧数据detail_id为0，需要通过sku_id + order_detail_id区分sku
     */
    const abnormalOrRefund =
      abnormalObject[v.id + '_' + _detail_id] &&
      abnormalObject[v.id + '_' + _detail_id][0] // 汇总数据只有一条，因此取第一条就好

    const realOutNum = +Big(v.real_weight || 0).plus(
      abnormalOrRefund?.['异常数量'] || 0, // 这里异常数量有正负,所以加即可
    )

    const abnormals = abnormalObject[v.id + '_' + _detail_id] || []
    let abnormalsPrice = Big(0)
    abnormals.forEach((v) => {
      abnormalsPrice = Big(abnormalsPrice).plus(
        Big(v?.['异常金额'] || 0).toFixed(2),
      )
    })

    const realOutNumSale = Big(realOutNum).div(v.sale_ratio).toFixed(2)
    const detailConfigs = globalStore.customizedDetailConfigs.filter(
      (v) => v.permission.read_station_delivery,
    )
    const map = {}
    const detailCustomizedField = v.detail_customized_field || {}
    detailConfigs.forEach((v) => {
      map[`自定义_${v.id}`] = getFiledData(v, detailCustomizedField)
    })

    if (specialConfig === 'orderQuanty' && v.quantity === 0.01) {
      v.quantity = '' // 下单数
      v.real_weight = 0 // 出库数
      v.real_item_price = 0 // 出库金额
      v.total_item_price = '' // 下单金额
      v.real_item_price_without_tax = 0 // 出库金额_不含税
      v.org_item_price = 0 // 原金额
      v.account_price = '' // 实际金额
      // 非表格数据
      data.total_price = '' // 下单金额
      data.real_price = '' // 出库金额
      data.total_pay = '' // 销售额_含运税
      data.before_change_total_pay = '' // 原销售额
    }

    if (
      specialConfig === 'basicUnit' &&
      v.std_unit_name_forsale !== v.sale_unit_name
    ) {
      data.real_price = '' // 出库金额
      data.total_pay = '' // 销售额_含运税
      data.before_change_total_pay = '' // 原销售额
      v.real_item_price = 0 // 出库金额
      v.real_item_price_without_tax = 0 // 出库金额_不含税
      v.account_price = '' // 实际金额
      data.total_price = '' // 下单金额
    }

    // 出库数_销售单位
    const outbound_sales_unit = v.real_weight
      ? //  供港客户保留两位小数
        globalStore.groupId === 2254
        ? Big(v.real_weight).div(v.sale_ratio).toFixed(2)
        : parseFloat(Big(v.real_weight).div(v.sale_ratio).toFixed(2))
      : ''

    return {
      ...map,
      ...abnormalOrRefund,
      序号: index + 1,
      组合商品名: v.combine_goods_name,
      商品ID: v.id,
      商品名: v.real_is_weight && !v.is_weigh ? `*${v.name}` : v.name,
      商品名_无星号: v.name,
      类别: v.category_title_1,
      商品二级分类: v.category_title_2,
      商品品类: v.pinlei_title,
      SPU名称: v.spu_name,
      规格:
        v.std_unit_name_forsale === v.sale_unit_name && v.sale_ratio === 1
          ? `按${v.sale_unit_name}`
          : `${v.sale_ratio}${v.std_unit_name_forsale}/${v.sale_unit_name}`,
      自定义编码: v.outer_id,
      商品自定义编码: v.spu_customize_code,
      商品描述: v.desc,
      备注: v.remark, // 商品备注
      箱号: _.join(
        _.map(v.box_list, (box) => box.box_no),
        ',',
      ),
      基本单位: v.std_unit_name_forsale,
      销售单位: v.sale_unit_name,

      /* ----下面4个[数量]字段: 如果是0,那么显示为空 --- */
      下单数: v.quantity || '',
      出库数_基本单位: v.real_weight || '',
      出库数_销售单位: outbound_sales_unit,
      称重数_销售单位: v.saleunit_weighting_quantity || v.quantity || '',
      /* ------------ */

      税率: v.is_set_tax
        ? `${Big(v.tax_rate || 0)
            .div(100)
            .toFixed(2)}%`
        : i18next.t('未设置'),
      不含税单价_基本单位: price(
        Big(v.sale_price_without_tax || 0).div(v.sale_ratio),
      ),
      不含税单价_销售单位: price(v.sale_price_without_tax),
      单价_基本单位: price(v.std_sale_price_forsale),
      单价_销售单位: price(v.sale_price),
      单价_基本单位_时价:
        price(v.std_sale_price_forsale) || '<strong>时价</strong>',
      单价_销售单位_时价: price(v.sale_price) || '<strong>时价</strong>',

      原单价_基本单位: price(v.org_std_sale_price_forsale),
      原单价_销售单位: price(v.org_sale_price),

      上浮率: v.rule_type === 2 ? v.yx_price + '%' : '', // 这个是后台非必传字段
      报价单原价: price(v.salemenu_price),
      变化率: getChangeRate(
        v.before_change_price_forsale,
        v.sale_price,
        v.yx_price,
        v.rule_object_type,
      ),
      变化前单价_基本单位: price(v.before_change_price),
      变化前单价_销售单位: price(v.before_change_price_forsale),

      实际出库数:
        mergeDeliveryType === '1'
          ? parseFloat(v.sku_std_accept_quantity_forsale ?? 0)
          : realOutNum,
      实际出库数_销售单位:
        mergeDeliveryType === '1' ? v.accept_quantity : realOutNumSale,
      实际金额:
        mergeDeliveryType === '1'
          ? v.account_price
          : price(Big(v.real_item_price).plus(abnormalsPrice)),
      初始下单数: Big(v.origin_purchase_quantity || 0).toFixed(2), // 订单下单时刻的下单数
      销售出库数: Big(v.sale_outstock_quantity || 0),
      销售出库金额: price(Big(v.sale_outstock_price || 0)),
      商品税额: Big(v.tax || 0).toFixed(2),
      出库金额: price(v.real_item_price),
      出库金额_不含税: price(v.real_item_price_without_tax),
      原金额: price(v.org_item_price),
      // 下单金额: price(Big(v.sale_price).times(v.quantity || 0)),
      下单金额: v.total_item_price,
      // 补差（销售单位）= 出库金额 — 单价（销售单位）* 出库数（销售单位）
      补差_销售单位: Big(price(v.real_item_price) || 0)
        .minus(
          Big(price(v.sale_price) || 0).times(Big(outbound_sales_unit || 0)),
        )
        .toString(),
      // 补差（基本单位）= 出库金额 — 单价（基本单位）* 出库数（基本单位
      补差_基本单位: Big(price(v.real_item_price) || 0)
        .minus(
          Big(price(v.std_sale_price_forsale) || 0).times(
            Big(v.real_weight || 0),
          ),
        )
        .toString(),

      定制_自采金额: v.self_pick_money,
      定制_自采数: v.self_pick_quantity,

      生产日期:
        (v.production_time && moment(v.production_time).format('YYYY-MM-DD')) ||
        '-',
      保质期: (v.life_time && moment(v.life_time).format('YYYY-MM-DD')) || '-',
      默认供应商: v.supplier_name,
      商品生产日期:
        (v.sku_production_date &&
          moment(v.sku_production_date).format('YYYY-MM-DD')) ||
        '-',
      折前金额: (
        price(v.before_change_price_forsale) *
        (v.real_weight
          ? parseFloat(Big(v.real_weight).div(v.sale_ratio).toFixed(2))
          : '')
      ).toFixed(2),
      品牌: v.brand || '-',
      区域: v.origin_area || '-',
      产地: v.origin_place || '-',
      商品规格: v.specification_desc || '-',
      商品特征: v.feature_desc || '-',
      售后标准: v.after_sale_desc || '-',
      实际下单数: Big(v?.order_quantity || 0).toFixed(2),
      实际下单金额: Big(v?.order_total_price || 0).toFixed(2),
      加单数1: v?.add_quantity_list?.[0].val ?? '-',
      加单数2: v?.add_quantity_list?.[1].val ?? '-',
      加单数3: v?.add_quantity_list?.[2].val ?? '-',
      加单数4: v?.add_quantity_list?.[3].val ?? '-',
      加单金额1: v?.add_quantity_list?.[0].amount ?? '-',
      加单金额2: v?.add_quantity_list?.[1].amount ?? '-',
      加单金额3: v?.add_quantity_list?.[2].amount ?? '-',
      加单金额4: v?.add_quantity_list?.[3].amount ?? '-',
      套账下单总数: Big(v?.sku_account_quantity || 0).toFixed(2),
      套账出库总数: Big(v?.sku_account_outstock_quantity || 0).toFixed(2),
      套账下单金额: Big(v?.sku_account_amount || 0).toFixed(2),
      套账出库金额: Big(v?.sku_account_outstock_amount || 0).toFixed(2),
      总加单金额: Big(v?.add_quantity_amount || 0).toFixed(2),
      _origin: v,
    }
  })
}

// 组合商品表
function combinationData(data) {
  // 组合商品
  const combination = _.map(data.combine_goods, (v, index) => {
    return {
      序号: ++index,
      组合商品名: v.name,
      类型: combineType(v.type),
      下单数: v.quantity,
      销售单位: v.sale_unit_name,
      含税单价_销售单位: price(v.unit_price),
      下单金额_参考金额: price(v.money),
      _origin: v,
    }
  })
  return [...combination]
}

// 异常商品表单
function generateAbnormalData(data, kOrders, isDetail) {
  const { refund, exception, no_sku_exceptions } = isDetail
    ? getExceptionAndRefund(data)
    : getExceptionAndRefund(data).totalData
  const refunds = []
  const abnormals = []
  const no_sku = []

  // 商品map
  const kIdMap = _.reduce(
    kOrders,
    (res, cur) => {
      const _idIndex =
        cur._origin.detail_id === undefined
          ? cur._origin.id
          : cur._origin.id + '_' + cur._origin.detail_id
      res[_idIndex] = cur
      return res
    },
    {},
  )

  let refundsData = refund
  let abnormalsData = exception
  if (globalStore.isHuaKang()) {
    refundsData = {}
    abnormalsData = {}
    _.each(refund, (value, key) => {
      if (kIdMap[key]) {
        refundsData[key] = value
      }
    })
    _.each(exception, (value, key) => {
      if (kIdMap[key]) {
        abnormalsData[key] = value
      }
    })
  }

  _.each(kOrders, (item) => {
    const _idIndex =
      item._origin.detail_id === undefined
        ? item._origin.id
        : item._origin.id + '_' + item._origin.detail_id
    if (exception[_idIndex]) {
      _.each(exception[_idIndex], (exc) => {
        abnormals.push({ ...item, ...exc })
      })
    }

    if (refund[_idIndex]) {
      _.each(refund[_idIndex], (ref) => {
        refunds.push({ ...item, ...ref })
      })
    }
  })

  _.each(no_sku_exceptions, (item) => {
    no_sku.push({
      ...item,
      商品名: '-',
    })
  })

  // 异常表单 = 退货商品 + 异常商品 + 非商品异常
  return [...abnormals, ...refunds, ...no_sku]
}

// 积分表格
function generateRewardData(list) {
  return _.map(list, (o) => ({
    积分商品名: o.sku_name,
    规格: o.sale_unit,
    兑换数: o.quantity,
    消耗积分: o.total_cost_point,
  }))
}

// 周转物表格
function turnoverData(data) {
  const turnover = _.map(data.turnovers, (v, index) => {
    return {
      序号: ++index,
      周转物名称: v.tname,
      单位: v.unit_name,
      单个货值: price(v.price),
      预借出数: v.apply_amount,
      借出数: v.amount,
      货值: price(v.total_price),
      关联商品: v.sku_name,
    }
  })
  return [...turnover]
}

/**
 * 处理订单数据
 * @param data
 * @param noAbnormal 是否不需要异常表格
 * @returns {{_table: {orders_category: [], reward: *, orders_category_multi: [], abnormal: ([]|[]|*), orders_category_multi_vertical: [], orders: *, orders_multi_vertical: [], orders_multi: Array}, common: {结款周期, 自提点联系方式: *, 下单时间_无年份: string, 销售额_含运税_大写: string|*, 下单时间_日期_无年份: string, 收货时间_日期_无年份: string, 当前时间: string, 收货时间: string, 当前时间_日期: string, 商品税额_大写: string|*, 原总金额: string, 收货时间_时间: string, 配送时间_日期_无年份: string, 销售经理电话, barcode: *, 线路, 收货地址: *, 收货时间_无年份: string, 配送时间: string, 收货人: *, 城区, 打印人: *, 满载框数, 优惠金额_大写: string|*, 收货人电话: *, 当前时间_日期_无年份: string, 当前时间_无年份: string, 订单溯源码, 当前时间_时间: string, 承运商: *, 下单时间_时间: string, 司机电话, 商户ID: string, 运费_大写: string|*, 收货时间_日期: string, 收货商户: *, 出库金额: string, 授信额度: string, 税额: string, 配送时间_日期: string, 下单员: *, 账户名: *, 商户公司: *, 自提点负责人: *, 结款方式: *, qrcode: string, 优惠金额: string, 异常金额: string, 收货方式: *, 商户自定义编码: *, 订单备注: *, 配送时间_无年份: string, 街道, 销售经理, 箱数: *, 原总金额_大写: string|*, 下单时间_日期: string, 下单金额: string, 下单时间: string, 自提点名称: *, 支付状态: *, 订单类型: string, 销售额_含运税: string, 下单金额_大写: string|*, 分拣序号: string, 配送时间_时间: string, 出库总数_销售单位: number, 异常金额_大写: string|*, 订单号: *, 车型, 下单总数_销售单位: number, 车牌号码, 运费: string, 出库金额_大写: string|*, 司机名称, 城市, 下单账号: *}, _origin: *, _counter: []}}
 */

function order(data, noAbnormal, mergeDeliveryType, pageConfig) {
  const specialConfig = pageConfig?.specialConfig
  // 商品列表
  let skuList = data.details
  const totalOrgItemPrice = getOrgItemPrice(skuList)
  if (globalStore.isHuaKang()) {
    skuList = _.filter(data.details, (v) => v.sale_outstock_price > 0)
  }
  // 周转物表格
  const turnover = turnoverData(data)
  // 组合商品表
  const combination = combinationData(data)
  /* ----------- 普通  ------------ */
  const kOrders = generateOrderData(
    skuList,
    data,
    mergeDeliveryType,
    specialConfig,
  )

  /* ----------- 双栏 -------------- */
  const kOrdersMulti = generateMultiData(kOrders)
  /* ----------- 双栏 (纵向)-------------- */
  const kOrdersMultiVertical = generateMultiData2(kOrders)
  /* ----------- 三栏 -------------- */
  const kOrdersMulti3 = generateMulti3Data(kOrders)
  /* ----------- 三栏 (纵向)-------------- */
  const kOrdersMulti3Vertical = generateMulti3Data2(kOrders)

  // 按一级分类分组
  const groupByCategory1 = _.groupBy(kOrders, (v) => v._origin.category_title_1)

  /* -------- 分类 和 双栏 + 分类 ------- */
  let kCategory = []
  let kCategoryMulti = []
  let kCategoryMulti3 = []
  let kCategoryMulti3Vertical = []
  let kCategoryMultiVertical = []
  const kCounter = [] // 分类汇总

  let index = 1
  _.forEach(groupByCategory1, (value, key) => {
    // 分类小计
    let subtotal = Big(0)
    const list = _.map(value, (sku) => {
      subtotal = subtotal.plus(sku._origin.real_item_price)
      return {
        ...sku,
        序号: index++,
      }
    })
    subtotal = subtotal.toFixed(2)
    const categoryTotal = {
      _special: {
        text: `${key}小计：${subtotal}`,
        upperCaseText: `${key}小计：${subtotal}&nbsp;&nbsp;&nbsp;大写：${coverDigit2Uppercase(
          subtotal,
        )}`,
      },
    }

    // 商品分类汇总数组
    kCounter.push({ text: key, len: value.length, subtotal })

    /* -------- 分类  ------------- */
    kCategory = kCategory.concat(list, categoryTotal)
    /* -------- 双栏 + 分类 ------- */
    kCategoryMulti = kCategoryMulti.concat(
      generateMultiData(list, categoryTotal),
    )
    /* -------- 三栏 + 分类 ------- */
    kCategoryMulti3 = kCategoryMulti3.concat(
      generateMulti3Data(list, categoryTotal),
    )
    /* -------- 双栏 + 分类（纵向） ------- */
    kCategoryMultiVertical = kCategoryMultiVertical.concat(
      generateMultiData2(list, categoryTotal),
    )
    /* -------- 双栏 + 分类（纵向） ------- */
    kCategoryMulti3Vertical = kCategoryMulti3Vertical.concat(
      generateMulti3Data2(list, categoryTotal),
    )
  })

  const showTotalOrgItemPrice = (skuList) => {
    if (specialConfig === 'basicUnit') {
      return skuList.some((v) => v.std_unit_name_forsale !== v.sale_unit_name)
    } else if (specialConfig === 'orderQuanty') {
      return skuList.some((v) => v.quantity === 0.01)
    }
  }
  // 原总金额
  const specialConfigTotalOrgItemPrice = showTotalOrgItemPrice(skuList)
    ? ''
    : price(totalOrgItemPrice)
  return {
    common: {
      ...generateCommon(data, mergeDeliveryType),
      ...generateSummary(skuList),
      ...generateUpperPrice(data, specialConfigTotalOrgItemPrice),
      原总金额: specialConfigTotalOrgItemPrice,
    },
    _counter: kCounter, // 分类商品统计
    _table: {
      orders: kOrders, // 普通
      orders_multi: kOrdersMulti, // 双栏
      orders_multi_vertical: kOrdersMultiVertical, // 双栏（纵向）

      orders_multi3: kOrdersMulti3, // 三栏
      orders_multi3_vertical: kOrdersMulti3Vertical, // 三栏 （纵向）

      orders_category: kCategory, // 分类
      orders_category_multi: kCategoryMulti, // 分类 + 双栏
      orders_category_multi3: kCategoryMulti3, // 分类 + 三栏
      orders_category_multi_vertical: kCategoryMultiVertical, // 分类+双栏（纵向）
      orders_category_multi3_vertical: kCategoryMulti3Vertical, // 分类+三栏（纵向）

      abnormalDetails: noAbnormal
        ? []
        : generateAbnormalData(data, kOrders, true), // 异常明细条目
      abnormal: noAbnormal ? [] : generateAbnormalData(data, kOrders, false), // 异常明细汇总
      reward: generateRewardData(data.reward_sku_list),
      combination: combination, // 组合商品
      turnover, // 周转物
    },
    _origin: data,
  }
}

export default order
