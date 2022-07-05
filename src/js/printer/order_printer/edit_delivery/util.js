import _ from 'lodash'

export const isRealSku = (sku) => sku.type === 1

export const isSameSku = (sku1, sku2) => sku1.raw_id === sku2.raw_id

export const convertToNumberIfNeeded = (key, n) =>
  [
    'freight',
    'quantity',
    'sale_ratio',
    'sale_price',
    'before_change_price_forsale',
    'real_weight',
    'real_item_price',
  ].includes(key)
    ? Number(n)
    : n

export const isInvalid = (value) => _.trim(value) === ''

export const isHuaKangReq = (skuList) => {
  for (const item of skuList) {
    delete item.real_quantity
    item.real_weight_lock = item.real_quantity_lock
    delete item.real_quantity_lock
  }
  return skuList
}
