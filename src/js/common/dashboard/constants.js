import Big from 'big.js'
import moment from 'moment'

export const TREND_ENUM = {
  saleData: 'account_price', // 销售额
  saleProfit: '', // 销售毛利
  orderData: 'old_order_id', // 订单数
  orderPrice: 'order_price',
  accountPrice: 'account_price', // 销售额
  orderId: 'old_order_id', // 订单数
}

export const formatData = (item, key) => {
  if (TREND_ENUM[key]) return Number(item[TREND_ENUM[key]])
  // 客单价 = 下单金额 / 商户数
  // 销售毛利 = 销售额 - (出库成本 - 退货成本)
  // 销售毛利润 = 销售毛利 / 销售额
  const {
    account_price,
    out_stock_cost,
    refund_cost,
    order_price,
    shop_id,
  } = item
  const saleProfit = +Big(account_price)
    .minus(out_stock_cost)
    .plus(refund_cost)
    .toFixed(2)
  const saleProfitRate = +Big(saleProfit)
    .div(account_price || 1)
    .times(100)
    .toFixed(2)

  if (key === 'saleProfit') return saleProfit
  if (key === 'saleProfitRate') return saleProfitRate
  if (key === 'customerPrice') {
    return +Big(order_price)
      .div(shop_id || 1)
      .toFixed(2)
  }
}

/**
 * @description 后台并没有给出所有时间，数组长度需要前端通过时间差格式化
 * @param {Date} begin 开始时间
 * @param {Date} end 结束时间
 * @param {Array} data 数据list
 */
export const formatTimeList = (begin, end, data) => {
  // 根据开始时间和结束时间取得时间差，也就是数组的长度
  const diff = moment(end).diff(moment(begin), 'days') + 1

  const list = [...new Array(diff)].map((_, index) => ({
    xAxis: moment(begin).add(index, 'days').format('YYYY-MM-DD'),
    yAxis: 0,
  }))
  if (Array.isArray(data)) {
    list.forEach((item) => {
      data.forEach((resItem) => {
        if (moment(resItem.xAxis).format('YYYY-MM-DD') === item.xAxis) {
          item.yAxis = resItem.yAxis
        }
      })
    })
  }

  return list
}

/**
 * @description 格式化饼状图数据 饼状图 只显示7+1（占比最多的7个+剩余的为其它）
 * @returns {Array}
 */
export const formarPieChartData = (list) => {
  if (!Array.isArray(list) || list.length === 0) return []
  const total = list
    .map((item) => Number(item.yAxis))
    .reduce((prev, next) => +Big(prev).plus(next))
  list.forEach((item) => {
    item.yAxis = Number(item.yAxis)
    item.percent = +Big(+item.yAxis)
      .div(total)
      .toFixed(4)
  })

  if (list.length > 7) {
    const newList = list.slice(0, 7)
    const otherList = list.slice(7, list.length)

    const otherPercent = otherList
      .map((item) => item.percent)
      .reduce((prev, next) => +Big(prev).plus(next))

    const otherYAxis = otherList
      .map((item) => item.yAxis)
      .reduce((prev, next) => +Big(prev).plus(next))

    newList.push({ xAxis: '其它', yAxis: otherYAxis, percent: otherPercent })
    return newList
  }
  return list
}
