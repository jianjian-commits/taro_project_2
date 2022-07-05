import { Request as _Request } from '@gm-common/request'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'
import Big from 'big.js'
import _ from 'lodash'

const Request = enhanceRequest(_Request)

// 销售驾驶仓 -- 销售数据
export const requestSaleData = (query) => {
  return Promise.all([
    Request('station_statistics/order/count') // 订单数
      .common(query)
      .post(),
    Request('station_statistics/order/account_price') // 销售额
      .common(query)
      .post(),
    Request('station_statistics/order/avg_customer_price') // 客单价
      .common(query)
      .post(),
    Request('station_statistics/order/shop_id') // 下单客户数
      .common(query)
      .post(),
    Request('station_statistics/order/sale_profit') // 销售毛利
      .common(query)
      .post(),
  ]).then((responses) => {
    const [orderData, saleData, customerPrice, shopId, saleProfit] = responses
    // 销售毛利率 = 销售毛利 / 销售额
    const saleProfitRate = {
      preValue: `${Big(saleProfit.saleProfit.preValue)
        .div(Number(saleData.saleData.preValue) || 1)
        .times(100)
        .toFixed(2)}`,
      value: Big(saleProfit.saleProfit.value)
        .div(Number(saleData.saleData.value) || 1)
        .times(100)
        .toFixed(2),
    }
    return {
      ...orderData,
      ...saleData,
      ...customerPrice,
      ...shopId,
      ...saleProfit,
      saleProfitRate,
    }
  })
}

// 销售驾驶舱 -- 销售趋势
/**
 *
 * @param {string} type 要查询的字段
 */
export const requestSaleTrend = (query) => {
  return Request('station_statistics/order/account_price') // 只调用一个接口
    .common(query)
    .group_by_fields([0])
    .order_by_fields([0])
    .post()
    .then((data) => data)
}

// 销售驾驶舱 -- 其他数据
export const requestSaleOtherData = (query) => {
  // 售后商品数的参数需要改变一下 用名otherQuery,使用loadsh深拷贝来完成
  const otherQuery = _.cloneDeep(query)
  otherQuery.query_expr.filter.push({ query_type: 6, query_argument: '> 0' })
  return Promise.all([
    Request('station_statistics/new_address') // 新增客户数 只需要传time_range，其他的传空值
      .common(query)
      .post(),
    Request('station_statistics/order/repeat_customers') // 客户复购率 只需要传时间
      .common(query)
      .group_by_fields([1])
      .post(),
    Request('station_statistics/order/has_after_sale') // 售后订单数
      .common(query)
      .post(),
    Request('station_statistics/order_detail/after_sale_times') // 售后商品数
      .common(otherQuery)
      .post(),
  ]).then((responses) => {
    const [
      newAddress,
      repeatCustomers,
      afterSaleOrder,
      afterSaleGoods,
    ] = responses

    return {
      ...newAddress,
      ...afterSaleOrder,
      ...afterSaleGoods,
      ...repeatCustomers,
    }
  })
}

// 销售驾驶舱 -- 商户销量排名
export const requestRankMerchant = (query, type = 'saleData') => {
  switch (type) {
    case 'saleData':
      return Request('station_statistics/order/account_price') // 销售额
        .common(query)
        .group_by_fields([1])
        .order_by_fields([1])
        .limit(10)
        .post()
        .then((data) => data)
    case 'orderData':
      return Request('station_statistics/order/count') // 订单数
        .common(query)
        .group_by_fields([1])
        .order_by_fields([1])
        .limit(10)
        .post()
        .then((data) => data)
    case 'saleProfit':
      return Request('station_statistics/order/sale_profit') // 销售毛利
        .common(query)
        .group_by_fields([1])
        .order_by_fields([1])
        .limit(10)
        .post()
        .then((data) => data)

    default:
      break
  }
}

// 销售驾驶舱 -- 销售经理业绩排行
export const requestRankPerformance = (query, type) => {
  return Request('station_statistics/order/account_price') // TODO: 可以用通用接口
    .common(query)
    .group_by_fields([2])
    .order_by_fields([type])
    .limit(10)
    .post()
    .then((res) => res.data)
}

// 销售驾驶舱 -- 售后趋势
export const requestSaleAfter = (query, type = 'afterSaleOrder') => {
  switch (type) {
    case 'afterSaleOrder':
      return Request('station_statistics/order/has_after_sale') // 售后订单数
        .common(query)
        .group_by_fields([0])
        .order_by_fields([0])
        .post()
    case 'afterSaleGoods':
      return Request('station_statistics/order_detail/after_sale_times') // 售后商品数
        .common(query)
        .group_by_fields([0])
        .order_by_fields([0])
        .post()
    default:
      break
  }
}
