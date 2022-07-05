import _ from 'lodash'
import Big from 'big.js'
import { isNumber } from '../../../common/util'
import { System } from '../../../common/service'

const getList = (data) => {
  return _.map(data, (v) => {
    return {
      ...v,
      sale_price:
        v.sale_price === 0
          ? 0
          : v.sale_price
          ? Big(v.sale_price).div(100).toFixed(2)
          : '-',
      new_price:
        v.new_price === 0
          ? 0
          : v.new_price
          ? Big(v.new_price).div(100).toFixed(2)
          : '',
      old_price: v.old_price === 0 ? 0 : Big(v.old_price).div(100).toFixed(2),
    }
  })
}

const getParams = (smartPriceFilter) => {
  const {
    sku_list,
    re_category1_ids,
    re_category2_ids,
    re_pinlei_ids,
    pinlei_ids,
    category2_ids,
    category1_ids,
    salemenu_ids,
  } = smartPriceFilter
  let params = Object.assign({}, smartPriceFilter, {
    sku_list: JSON.stringify(sku_list),
    re_category1_ids: JSON.stringify(re_category1_ids),
    re_category2_ids: JSON.stringify(re_category2_ids),
    re_pinlei_ids: JSON.stringify(re_pinlei_ids),
    pinlei_ids: JSON.stringify(pinlei_ids),
    category2_ids: JSON.stringify(category2_ids),
    category1_ids: JSON.stringify(category1_ids),
    salemenu_ids: JSON.stringify(salemenu_ids),
  })
  params = _.omit(params, ['modify_sku_list'])
  if (System.isC()) params.is_retail_interface = 1
  return params
}

const getSkuList = (sku_list, changeList) => {
  return _.map(sku_list, (v) => {
    const sku = _.find(changeList, (l) => l.sku_id === v.sku_id)

    let price =
      v.new_price === 0
        ? 0
        : v.sale_price
        ? Big(v.new_price).div(100).toFixed(2)
        : ''
    let sale_price =
      v.sale_price === 0
        ? 0
        : v.sale_price
        ? Big(v.sale_price).div(100).toFixed(2)
        : '-'
    price = sku ? sku.price : price
    sale_price = sku
      ? isNumber(sku.price)
        ? Big(sku.price).times(v.ratio).toFixed(2)
        : '-'
      : sale_price

    return {
      ...v,
      sale_price,
      new_price: price,
      old_price:
        v.old_price === 0
          ? 0
          : v.old_price
          ? Big(v.old_price).div(100).toFixed(2)
          : '',
      status: sku ? sku.status : 0,
      over_suggest_price: sku ? sku.over_suggest_price : v.over_suggest_price,
    }
  })
}

export { getList, getParams, getSkuList }
