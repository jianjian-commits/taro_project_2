import { getCharLength } from 'gm-util'
import _ from 'lodash'

import {
  isSkuInValid,
  isOrderTimeValid,
  isCustomerFalse,
  filterSkusCommon,
  isQuantityInvalid,
} from '../util'
export const isOrderInvalidOld = (order) => {
  const {
    repair,
    viewType,
    time_config_info,
    currentTime,
    customer = {},
  } = order

  if (isSkuInValid(order)) {
    return true
  }

  // 当前时间是否在下单时间范围内
  let isTimeValid = true

  if (time_config_info && time_config_info.order_time_limit) {
    const {
      start,
      end,
      e_span_time,
      s_span_time,
    } = time_config_info.order_time_limit

    if (
      !repair &&
      !isOrderTimeValid(
        viewType,
        currentTime,
        start,
        end,
        e_span_time,
        s_span_time,
      )
    ) {
      isTimeValid = false
    }
  }

  if (!order.details.length || !isTimeValid) {
    return true
  }

  // 商户状态判断 所有商户信用状态码 => 0，正常；11，白名单；12，信用额度内；13，超额；14，欠款（当没授信的时候返回）; 15,冻结; 16,先款后货用户无法在此下单; 100,其他
  if (viewType === 'create') {
    if (isCustomerFalse(customer)) {
      return true
    }
  }

  const skuData = filterSkusCommon(order.details)
  // 检查是否存在输入不正确的sku
  return _.find(skuData, (sku) => {
    return (
      sku.code ||
      isQuantityInvalid(sku.quantity, sku.sale_num_least) ||
      sku?.spu_remark?.length > 50
    )
  })
}
