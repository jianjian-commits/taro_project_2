import _ from 'lodash'
import { i18next } from 'gm-i18n'
import Big from 'big.js'
import moment from 'moment'
import {
  getDynamicFreight,
  isOrderTimeValid,
  isNoAvailReceiveTime,
} from '../util'

const ordersValidFun = (orders) => {
  return !!_.find(orders, (order) => {
    const { time_config_info, skus, code, freight, total_price } = order
    return (
      code > 0 ||
      !!serviceTimeValidFun(time_config_info) ||
      !!_.find(skus, (sku) => sku.code > 0) ||
      skus.length === 0 ||
      (freight && total_price < freight.min_total_price)
    )
  })
}

const serviceTimeValidFun = (time_config_info) => {
  const {
    start,
    end,
    e_span_time,
    s_span_time,
  } = time_config_info.order_time_limit
  if (
    !isOrderTimeValid('create', moment(), start, end, e_span_time, s_span_time)
  ) {
    return i18next.t('当前时间无法下单')
  }

  if (isNoAvailReceiveTime(time_config_info, moment())) {
    return i18next.t('无可用收货时间')
  }
  return null
}

const getOrderPrice = (skus, freight, receive_way) => {
  let result = 0
  _.forEach(skus, (sku) => {
    if (sku.code) {
      result += 0
    } else if (sku.is_price_timing || sku.isCombineGoodsTop) {
      result += 0
    } else {
      result += (+sku.sale_price || 0) * (+sku.quantity || 0)
    }
  })

  return Big(result)
    .add(getDynamicFreight(freight, result, receive_way))
    .toFixed(2)
}

const validTip = (skus, total_price, freight) => {
  const validSku = _.find(skus, (sku) => sku.msg)
  if (validSku) {
    const msg = `${i18next.t('存在商品')}${validSku.msg}`
    return msg
  }

  if (_.find(skus, (sku) => sku.code > 0)) {
    return i18next.t('商品异常')
  }

  if (freight && total_price < freight.min_total_price) {
    return i18next.t('未满起送价') + freight.min_total_price
  }

  if (_.find(skus, (sku) => sku.sku_data && sku.sku_data.length > 0)) {
    return i18next.t('商品未完全识别')
  }
}

const skuValidFun = (skus) =>
  _.find(
    skus,
    (sku) => sku.code > 0 || (sku.sku_data && sku.sku_data.length > 0),
  )

const getOrderExpanded = (orders) => {
  const map = {}
  _.forEach(orders, (order, i) => {
    map[i] =
      order.code > 0 ||
      (order.skus && skuValidFun(order.skus)) ||
      order.msg ||
      order.remark === undefined ||
      (order.time_config_info && serviceTimeValidFun(order.time_config_info)) ||
      (order.freight && order.total_price < order.freight.min_total_price)
  })
  return map
}

const getSkusExpanded = (list) => {
  const map = {}
  _.forEach(list, (item, i) => {
    map[i] = item.code > 0 || (item.sku_data && item.sku_data.length > 0)
  })
  return map
}

const getUnit = (rowData, is_combine_goods = false) => {
  if (rowData.isCombineGoodsTop || is_combine_goods) {
    return i18next.t('KEY48', {
      VAR1: rowData.sale_unit_name || rowData.default_sale_unit_name,
    }) /* src:`按${rowData.std_unit_name}` => tpl:按${VAR1} */
  }

  if (
    rowData.std_unit_name_forsale === rowData.sale_unit_name &&
    rowData.sale_ratio === 1
  ) {
    return i18next.t('KEY48', {
      VAR1: rowData.std_unit_name_forsale,
    }) /* src:`按${rowData.std_unit_name}` => tpl:按${VAR1} */
  }

  return `${rowData.sale_ratio}${rowData.std_unit_name_forsale}/${
    rowData.sale_unit_name || rowData.default_sale_unit_name
  }`
}

export {
  getUnit,
  getOrderPrice,
  getOrderExpanded,
  getSkusExpanded,
  skuValidFun,
  serviceTimeValidFun,
  ordersValidFun,
  validTip,
}
