import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { MULTI_SUFFIX } from 'gm-printer'
import { coverDigit2Uppercase, price, weekMap } from './util'
import { renderOrderTypeName } from 'common/deal_order_process'
import globalStore from 'stores/global'
import { getFiledData } from '../../../../common/components/customize'
import { priceReal } from '../../util'

const PAY_STATUS = {
  1: '未支付',
  5: '部分支付',
  10: '已支付',
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
 * 生成 双栏+纵向 双栏+分类+纵向 商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMultiData2(list, categoryTotal, pageConfig) {
  const {
    financeSpecialConfig: { pageFixLineNum },
  } = pageConfig
  // 1.将数据进行分组
  const chunkList = _.chunk(list, pageFixLineNum * 2)
  const resList = []
  for (let i = 0; i < chunkList.length; i++) {
    const multiList = []
    // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:3}, {a:2, a#2: 4}]
    const skuGroup = chunkList[i]

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
    resList.push(multiList)
  }
  return _.flatten(resList)
}

// 非表格数据
function generateCommon(data, mergeDeliveryType) {
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
    账户名: data.username,
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
      'YYYY年MM月DD日',
    )}`,
    // 收货时间_日期: `${moment(data.receive_begin_time).format(
    //   'YYYY-MM-DD',
    // )} ~ ${moment(data.receive_end_time).format('YYYY-MM-DD')}`,
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

    商户公司: data.resname,
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

    const abnormals = abnormalObject[v.id + '_' + _detail_id] || []
    let abnormalsPrice = Big(0)
    abnormals.forEach((v) => {
      abnormalsPrice = Big(abnormalsPrice).plus(
        Big(v?.['异常金额'] || 0).toFixed(2),
      )
    })

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

    return {
      ...map,
      ...abnormalOrRefund,
      序号: index + 1,
      // 商品名: v.real_is_weight && !v.is_weigh ? `*${v.name}` : v.name,
      // 客户不要带星的
      商品名: v.name,
      出库数_销售单位: v.real_weight
        ? //  供港客户保留两位小数
          globalStore.groupId === 2254
          ? Big(v.real_weight).div(v.sale_ratio).toFixed(2)
          : parseFloat(
              Big(v?.real_weight ?? 0)
                .div(v?.sale_ratio ?? 0)
                .toFixed(2),
            )
        : '',
      销售单位: v?.sale_unit_name ?? '',
      单价_销售单位: price(v.sale_price),
      出库金额: priceReal(v.real_item_price),

      _origin: v,
    }
  })
}
function getOrgItemPrice(list) {
  let totalOrgItemPrice = Big(0)
  _.each(list, (v) => {
    totalOrgItemPrice = totalOrgItemPrice.plus(v.org_item_price)
  })
  return totalOrgItemPrice
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
  const kOrdersMultiVertical = generateMultiData2(kOrders, false, pageConfig)
  // 按一级分类分组
  const groupByCategory1 = _.groupBy(kOrders, (v) => v._origin.category_title_1)

  /* -------- 分类 和 双栏 + 分类 ------- */
  let kCategory = []
  let kCategoryMulti = []
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

      orders_category: kCategory, // 分类
    },
    _origin: data,
  }
}

export default order
