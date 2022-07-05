import { Request as _Request } from '@gm-common/request'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'
const Request = enhanceRequest(_Request)
/** ********************************** 商品销售分析 *********************************/

// 商品销售分析 - 销售数据
export const requestOrderDetailSaleData = (query) => {
  return Request('station_statistics/order_detail') // 销售额
    .common(query)
    .post()
    .then((res) => res.data)
}

// 商品销售分析 - 商品销售排行
export const requestOrderDetailRankSale = (query, type = 'sale') => {
  switch (type) {
    case 'sale':
      return Request('station_statistics/order_detail/account_price')
        .common(query)
        .group_by_fields([3])
        .order_by_fields([1])
        .limit(10)
        .post()
        .then((res) => res.data)
    case 'order':
      return Request('station_statistics/order_detail/order')
        .common(query)
        .group_by_fields([3])
        .order_by_fields([2])
        .limit(10)
        .post()
        .then((res) => res.data)
    default:
      break
  }
}

// 商品销售分析 - 售后商品排行
export const requestOrderDetailAfterSale = (query) => {
  query.query_expr.filter.push({ query_type: 6, query_argument: '> 0' }) // 过滤为0的售后商品排行数据
  return Request('station_statistics/order_detail/after_sale_times')
    .common(query)
    .group_by_fields([3])
    .order_by_fields([3])
    .limit(10)
    .post()
    .then((res) => res.data)
}

// 商品销售分析 - 表格
export const requestSaleTableList = (query, pagination, sortBy) => {
  return Request('station_statistics/order_detail/products_analysis')
    .common(query)
    .limit(pagination.limit)
    .offset(pagination.offset)
    .order_by_fields([sortBy])
    .post()
    .then((res) => res)
}

// 分类销售分析 - 热销分类
export const requestOrderDetailHotCategory = (query, group_by_fields = [1]) => {
  return Request('station_statistics/order_detail/account_price') // 热销分类
    .common(query)
    .group_by_fields(group_by_fields)
    .order_by_fields([1])
    .post()
    .then((res) => res.data)
}

//  商品畅销排行 - 未使用
export const requestSaleableRank = (query) => {
  return Request('station_statistics/order_detail/account_price')
    .common(query)
    .group_by_fields([3])
    .order_by_fields([1])
    .post()
    .then((res) => res.data)
}

// 商品滞销排行 - 未使用
export const requestUnsaleableRank = (query) => {
  return Request('station_statistics/order_detail/after_sale_times')
    .common(query)
    .group_by_fields([3])
    .order_by_fields([1])
    .post()
    .then((res) => res.data)
}

// 分类销售分析表格
export const requestSortTableList = (query, pagination, sortBy) => {
  return Request('station_statistics/order_detail/pinlei_products_analysis')
    .common(query)
    .limit(pagination.limit)
    .offset(pagination.offset)
    .order_by_fields([sortBy])
    .post()
    .then((res) => res)
}

/** ********************************** 销售分表总表 *********************************/

export const requestDetailSaleData = (query) => {
  return Request('station_statistics/order_detail') // 销售额
    .common(query)
    .post()
    .then((res) => res)
}

// 下单商户商品出库单价的接口
export const fetchDetailPriceTrendStock = (query) => {
  return Request('station_statistics/order_detail') // 销售额
    .common(query)
    .group_by_fields([0])
    .order_by_fields([0])
    .post()
    .then((res) => res)
}

// 销售销售分析 - 分表 -商品销售额趋势
export const requestDetailSaleDataTrend = (query) => {
  return Request('station_statistics/order_detail/account_price') // 销售额
    .common(query)
    .group_by_fields([0])
    .post()
    .then((res) => res.data)
}

// 销售销售分析 - 分表 -购买客户排行
export const requestDetailShopRank = (query) => {
  return Request('station_statistics/order_detail/account_price') // 销售额
    .common(query)
    .group_by_fields([4])
    .limit(10)
    .order_by_fields([1])
    .post()
    .then((data) => {
      return data.data
    })
}

// 销售销售分析 - 分表 - 表格
export const requestGoodsTableList = (query, pagination = {}, sortBy) => {
  return Request('station_statistics/order_detail/single_product_analysis') // 销售额
    .common(query)
    .limit(pagination.limit)
    .order_by_fields([sortBy])
    .offset(pagination.offset)
    .post()
    .then((data) => data)
}
