import { Request as _Request } from '@gm-common/request'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'

const Request = enhanceRequest(_Request)

/** ************************************* 销售驾驶舱 ********************************* */

/** ********************************** 客户购买 *********************************/

/** ********************************** 销售总表 *********************************/
export const requestOrderDetailHotCategory = (query, group_by_fields = [1]) => {
  return Request('station_statistics/order_detail/account_price') // 热销分类
    .common(query)
    .group_by_fields(group_by_fields)
    .order_by_fields([1])
    .post()
    .then((res) => res.data)
}
