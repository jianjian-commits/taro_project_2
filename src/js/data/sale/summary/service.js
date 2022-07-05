import { Request as _Request } from '@gm-common/request'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'

const Request = enhanceRequest(_Request)

// 销售总表 - 销售数据
export const requestTotalSaleData = (query) => {
  return Request('station_statistics/order')
    .common(query)
    .post()
    .then((res) => res)
}

// 销售总表 -- 销售趋势
export const requestTotalSaleTrend = (query) => {
  return Request('station_statistics/order/account_price')
    .common(query)
    .group_by_fields([0])
    .order_by_fields([0])
    .post()
    .then((res) => res)
}

// 销售总表 -- 客单价｜笔单价
export const requestCustomerPriceOrOrderPrice = (
  query,
  type = 'customerPrice',
) => {
  switch (type) {
    case 'customerPrice': // 客单价
      return Request('station_statistics/order/avg_customer_price')
        .common(query)
        .group_by_fields([0])
        .order_by_fields([0])
        .post()
        .then((res) => res.data)
    case 'orderPriceAvg': // 笔单价
      return Request('station_statistics/order/avg_order_price')
        .common(query)
        .group_by_fields([0])
        .order_by_fields([0])
        .post()
        .then((res) => res.data)
    default:
      break
  }
}

export const requestTableList = (query, pagination, sortBy) => {
  return Request('station_statistics/order/summary_analysis')
    .common(query)
    .limit(pagination.limit)
    .order_by_fields([sortBy])
    .offset(pagination.offset)
    .post()
}
