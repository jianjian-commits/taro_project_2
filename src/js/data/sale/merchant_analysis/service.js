import { Request as _Request } from '@gm-common/request'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'
import { formatAllOrderDetail } from 'common/dashboard/sale/adaptor'
const Request = enhanceRequest(_Request)

// 客户购买 -- 总表 -- 销售数据
export const requestSaleDataFromMerchant = (query) => {
  return Promise.all([
    Request('station_statistics/order').common(query).post(),
    Request('station_statistics/order/avg_customer_price').common(query).post(), // 客单价
    Request('station_statistics/order/repeat_customers')
      .common(query)
      .group_by_fields([1])
      .post(),
  ]).then((responses) => {
    const [allData, customerPrice, repeatCustomers] = responses

    return { ...allData, ...customerPrice, ...repeatCustomers }
  })
}

// 客户购买分析 -- 总表 -- 客户排行
export const requestRankDataFromMerchant = (query) => {
  return Request('station_statistics/order/account_price')
    .common(query)
    .group_by_fields([1])
    .order_by_fields([1])
    .limit(10)
    .post()
    .then((data) => data.data)
}

// 客户购买分析 -- 总表 -- 下单客户
export const requestOrderDataFromMerchant = (query) => {
  return Request('station_statistics/order/shop_id')
    .common(query)
    .group_by_fields([0])
    .order_by_fields([0])
    .post()
    .then((data) => data.data)
}

// 客户购买分析 -- 总表 -- 表格
export const requestTableDataFromMerchant = (
  query,
  pagination = {},
  sortBy,
) => {
  return Request('station_statistics/order/customers_analysis')
    .common(query)
    .limit(pagination.limit)
    .offset(pagination.offset)
    .order_by_fields([sortBy])
    .post()
}

/**
 * 客户购买分析 -- 总表 -- 线路地区分布
 * @param {*} query
 * @param {Array} group_by_fields
 */
export const requestDistrictDataFromMerchant = (query, group_by_fields) => {
  return Request('station_statistics/order/account_price')
    .common(query)
    .group_by_fields(group_by_fields)
    .order_by_fields([1])
    .post()
    .then((res) => res.data)
}

// 客户购买 -- 分表 -- 销售数据
export const requestSaleDataFromMerchantDetail = (query, merchant_id) => {
  return Promise.all([
    Request('station_statistics/order') // 订单数
      .common(query)
      .post(),
    Request('station_statistics/order_detail') // 购买商品种数
      .common(query)
      .post(),
  ]).then((responses) => {
    const [allData, skuRes] = responses
    const skusData = formatAllOrderDetail(skuRes?.data)
    const skus = { ...skusData, ...allData }
    return { ...skuRes, ...skus }
  })
}

// 客户购买-分表-客户购买量
export const requestSaleTrendFromMerchantDetail = (query, type) => {
  return Request('station_statistics/order/count') // 订单数
    .common(query)
    .order_by_fields([0])
    .group_by_fields([0])
    .post()
    .then((res) => res.data)
}

// 客户购买-分表-客户笔单价
export const requestOrderPriceAvgFromMerchantDetail = (query) => {
  return Request('station_statistics/order/avg_order_price')
    .common(query)
    .order_by_fields([0])
    .group_by_fields([0])
    .post()
    .then((res) => res.data)
}

// 客户购买-分表-购买商品排行
export const requestProductRank = (query) => {
  return Request('station_statistics/order_detail')
    .common(query)
    .order_by_fields([1])
    .group_by_fields([3])
    .limit(10)
    .post()
    .then((res) => res)
}

// 客户购买-分表-购买分类分布
export const requestSortData = (query, type) => {
  return Request('station_statistics/order_detail')
    .common(query)
    .order_by_fields([1])
    .group_by_fields([type])
    .post()
    .then((res) => res)
}

// 客户购买-分表-表格
export const requestTableList = (query, pagination, sortBy) => {
  return Request('station_statistics/order/single_customer_analysis')
    .common(query)
    .limit(pagination.limit)
    .offset(pagination.offset)
    .order_by_fields([sortBy])
    .post()
    .then((res) => res)
}
