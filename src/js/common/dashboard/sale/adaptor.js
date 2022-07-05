import Big from 'big.js'
import { evaluateInfix } from './calculator'

function tas(str, kv) {
  let s
  // options 表示 str 中 可能出现的字符串
  const options = ['(', ')', '-', '+', '/', '*', '%']
  const res = []
  for (let i = 0; i < str.length; i++) {
    // str 字符串中的每一项
    const item = str[i]

    if (/\d/.test(item)) res.push(item)
    if (item === ' ') continue
    if (!options.includes(item)) {
      if (s !== undefined) continue
      s = i
    } else {
      if (s !== undefined) {
        const key = str.slice(s, i).trim()
        const v = kv[key]
        res.push(v)
        s = undefined
      }
      res.push(item)
    }
  }
  if (s !== undefined) {
    const key = str.slice(s)
    const v = kv[key]
    res.push(v)
  }

  return res.join('')
}

function calc(str, map = {}) {
  str = tas(str, map)
  // 需要转成Big
  return Big(evaluateInfix(str)).toFixed(2)
}

/**
 * @param {*} res response
 * @param {*} fieldName
 * @param {*} valueName 格式 xxx/yyyy xxx为分子 yyy为分母
 * @return {object} { key: { value, preValue } }
 */
export function orderAptAvg(res, fieldName, valueName = '') {
  const value = calc(valueName, res.data.data[0]?.modelValues[0]?.kv)

  const resValue = Big(Number(value || 0)).toFixed(2)

  const hasPreValue = !!res.data.data[1]?.modelValues[0]?.kv

  let preValue

  if (hasPreValue) {
    preValue = calc(valueName, res.data.data[1]?.modelValues[0].kv)
    preValue = Big(Number(preValue || 0)).toFixed(2)
  }

  return { [fieldName]: { value: resValue, preValue } }
}

/**
 * @description 格式化数据用，不能动
 * @param {object} res
 * @param {object} fields { text: 名称（选填）, yAxis数据字段名  xAxis时间字段名, field 自定义字段名 }
 * @param {string|number} key relateData 的key
 * @return {object} {text, value, preValue, data: {value, xAxis}[]}
 */
export function groupByApt(res, fields = {}, key) {
  const { text = '', field = '' } = fields
  const formatData = {
    text,
    value: 0,
    preValue: 0,
    data: [],
    field,
  }
  if (!res) return formatData

  const data = res.data.data[0].modelValues
  const relateData = res.data?.relate_data
  let map = {}

  if (!data) return formatData
  if (relateData && key && Object.keys(relateData)?.length)
    map = relateData[key]

  const isRelateData = key && Object.keys(map)?.length

  data.forEach((item) => {
    formatData.data.push({
      ...item.kv,
      yAxis: calc(fields.yAxis, item.kv),
      xAxis: isRelateData
        ? map[item.kv[fields.xAxis]]?.name
        : item.kv[fields.xAxis],
    })
  })

  return formatData
}

export function tableApt(res, adder = () => {}) {
  if (res?.data?.async) return res
  const data = res.data.data[0].modelValues
  const { count, limit, offset } = res.data.data[0] || {}
  const pagination = {
    count,
    limit,
    offset,
  }
  const relate_data = res?.data?.relate_data || {}
  if (!data) return { data: [], pagination }

  const list = data.map((item) => {
    const obj = {
      ...item.kv,
      ...adder(item),
    }
    Object.keys(relate_data).forEach((key) => {
      obj[`${key}_name`] = relate_data[key][item.kv[key]]?.name
    })

    return obj
  })

  return { data: list || [], pagination }
}

/**
 * @description 用于公共接口，查销售数据
 * @param {Object} data
 */
export const formatAllData = (data = {}) => {
  const {
    shop_id,
    account_price,
    old_order_id,
    out_stock_cost,
    refund_cost,
    order_price,
  } = data
  // 销售毛利 = 销售额 - (出库成本 - 退货成本)
  // 销售毛利润 = 销售毛利 / 销售额
  // 笔单价 = 下单金额 / 订单数
  const saleProfit = +Big(account_price)
    .minus(out_stock_cost)
    .plus(refund_cost)
    .toFixed(2)

  const saleProfitRate = +Big(saleProfit)
    .div(Number(account_price) || 1)
    .times(100)
    .toFixed(2)
  const orderPriceAvg = +Big(order_price)
    .div(Number(old_order_id) || 1)
    .toFixed(2)
  return {
    shopId: { value: shop_id }, // 下单客户数 ?
    orderData: { value: old_order_id }, // 订单数
    orderPrice: { value: order_price }, // 下单金额
    saleData: { value: account_price }, // 销售额
    saleProfit: { value: saleProfit }, // 销售毛利
    saleProfitRate: { value: saleProfitRate },
    orderPriceAvg: { value: orderPriceAvg }, // 笔单价
    // customerPrice: '', // 客单价
    // customerRepeatBuyRate: '', // 客户复购率
  }
}

/**
 * @description 格式化商品数据，用于公共接口
 * @param {Object} res res.data
 */
export const formatAllOrderDetail = (res = {}) => {
  const data = res?.data[0]?.modelValues[0].kv || {}

  const {
    sku_id,
    order_id,
    account_price,
    out_stock_cost,
    refund_cost,
    quantity,
  } = data
  const saleProfit = +Big(account_price)
    .minus(out_stock_cost)
    .plus(refund_cost)
    .toFixed(2)
  const saleProfitRate = +Big(saleProfit)
    .div(Number(account_price) || 1)
    .times(100)
    .toFixed(2)
  const saleAvg = +Big(account_price)
    .div(Number(order_id) || 1)
    .toFixed(2)
  return {
    skus: { value: sku_id },
    saleData: { value: account_price }, // 销售额
    saleProfit: { value: saleProfit }, // 销售毛利
    saleProfitRate: { value: saleProfitRate }, // 销售毛利率
    totalQuantity: { value: quantity },
    saleTimes: { value: order_id },
    saleAvg: { value: saleAvg },
  }
}

/**
 * @description 计算客单价 客单价 = 下单金额 / 商户数 order_price/ shop_id
 * @param {Object} data
 */
export const formatDataForCustomerPrice = (data) => {
  if (!data) return {}
  const newData = data?.data?.data[0]?.modelValues[0].kv || {}
  const { order_price, shop_id } = newData
  const customerPrice = Big(Number(order_price) || 0)
    .div(Number(shop_id) || 1)
    .toFixed(2)
  return {
    customerPrice: { value: customerPrice },
  }
}
/**
 * @description 计算客户复购率 复购率 = 订单数大于1的客户总数/所有下过单的客户总数
 * @param {*} data
 */
export const formatDataForRepeatCustomers = (data) => {
  if (!data) return {}
  const list = data?.data?.data[0]?.modelValues || []

  const newList = list.filter((item) => Number(item.kv.old_order_id) > 1)
  const repeatCustomers = +Big(newList.length || 0)
    .div(list.length || 1)
    .times(100)
    .toFixed(2)

  return {
    repeatCustomers: { value: repeatCustomers },
  }
}
