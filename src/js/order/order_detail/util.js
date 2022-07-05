import { t } from 'gm-i18n'
import { pinyin } from '@gm-common/tool'
import Big from 'big.js'
import _ from 'lodash'

import { getAllSkuTotalPrice, getDynamicFreight } from '../util'

const isOrderDistributing = (order) => {
  return order.status === 15 || order.status === 10
}

const isChinese = (w) => {
  return /^[\u4E00-\u9FA5]+$/.test(w)
}

const pinYinFirstLetterCache = {}
const getPinYinFirstLetter = (w) => {
  let fl = pinYinFirstLetterCache[w]
  if (!fl) {
    fl = _.map(
      pinyin(w, {
        style: pinyin.STYLE_NORMAL,
      }),
      (v) => v[0][0],
    ).join('')
    pinYinFirstLetterCache[w] = fl
  }
  return fl
}

const getFirstPinYinCharCode = (w) => {
  const convertToArray = w.split('')
  let firstLetter = ''
  _.each(convertToArray, (cta) => {
    if (!isChinese(cta)) {
      firstLetter += cta
    } else {
      firstLetter += getPinYinFirstLetter(cta)
    }
  })
  return firstLetter
}

const sortByFirstLetterBase = (a, b) => {
  const ap = getFirstPinYinCharCode(a)
  const bp = getFirstPinYinCharCode(b)
  if (ap < bp) {
    return -1
  } else if (ap === bp) {
    return 0
  } else {
    return 1
  }
}

const getSkusPrice = (order) => {
  const { details: skus, freight, viewType, receive_way } = order

  // 过滤空行
  const skuData = _.filter(skus, (item) => item.id !== null)
  // 下单金额,出库金额
  const allSkuTotalPrice = getAllSkuTotalPrice(skuData, 1)
  const realSkuTotalPrice = getAllSkuTotalPrice(skuData, 0)
  // 运费
  const dynamicFreight = getDynamicFreight(
    freight,
    allSkuTotalPrice,
    receive_way,
  )
  const total = Big(allSkuTotalPrice).add(dynamicFreight).toFixed(2)

  let totalPrice = 0
  let realPrice = 0
  let totalPay = 0
  if (viewType === 'view') {
    totalPay = Big(order.total_pay).toFixed(2)
    totalPrice = Big(order.total_price).toFixed(2)
    realPrice = Big(order.real_price).toFixed(2)
  } else {
    // 编辑状态,加上异常与退货
    const abnormal = Big(order.abnormal_money || 0).div(100)
    const refund = Big(order.refund_money || 0).div(100)
    const coupon = Big(order.coupon_amount || 0).div(100)
    totalPay = Big(realSkuTotalPrice)
      .add(dynamicFreight)
      .add(abnormal)
      .add(refund)
      .minus(coupon)
      .times(100)
      .toFixed(2)
    totalPrice = Big(allSkuTotalPrice).times(100).toFixed(2)
    realPrice = Big(realSkuTotalPrice).times(100).toFixed(2)
  }

  return {
    total,
    totalPrice,
    realPrice,
    totalPay,
    dynamicFreight,
  }
}

const findItemFromType = (arr, type) => {
  return _.find(arr, (item) => item.type === type) || {}
}

const mapForChange = (changed, target) => {
  _.forEach(changed, (value, key) => {
    target[key] = value
  })
}

// 多sku下单 -- 判断组合商品单 or 多sku单
const isSkusOrCombineGoodsOrder = (details) => {
  // 是否已存在组合商品
  const hasCombineGoods = _.findIndex(details, (sku) => sku.is_combine_goods)
  // 是否已经存在多sku
  const _details = _.filter(details, (sku) => sku.id !== null)
  const group = _.uniqBy(_details, (sku) => sku.id)
  const hasSameSkus = !(group.length === _details.length)

  return {
    isCombineGoodsOrder: hasCombineGoods !== -1,
    isSkusOrder: hasSameSkus,
  }
}

// 多sku下单提示 -- 多sku和组合商品互斥，两者不可在同一订单中。其余走正常逻辑
const getInfoOfOrderSkus = (newSku, details) => {
  const { isCombineGoodsOrder, isSkusOrder } = isSkusOrCombineGoodsOrder(
    details,
  )
  // 是否添加相同的sku
  const isSameSku = _.findIndex(
    details,
    (sku) => sku.id === newSku.id && !sku.belongWith,
  )

  if (isCombineGoodsOrder) {
    return isSameSku !== -1
      ? t('当前已添加过组合商品，暂不支持组合商品和重复商品同时添加')
      : null
  }

  if (!isCombineGoodsOrder && newSku.is_combine_goods) {
    return isSkusOrder
      ? t('当前已添加过重复商品，暂不支持组合商品和重复商品同时添加')
      : null
  }

  return null
}

// 更新订单中各个商品的下单数情况
const getSkusQuantity = (details) => {
  const skusGroup = _.groupBy(details, (sku) => sku.id)
  const skusQuantity = _.map(skusGroup, (value, key) => {
    const totalQuantity = _.sumBy(value, (v) => parseFloat(v.quantity))
    return {
      id: key,
      totalQuantity: totalQuantity
        ? Big(totalQuantity).toFixed(2)
        : totalQuantity,
      sale_num_least: value[0].sale_num_least || 0,
    }
  })
  return skusQuantity
}

const getActualQuantity = (sku) => {
  let q = parseFloat(
    Big(_.toNumber(sku.quantity || 0))
      .plus(
        Big(sku.exc_quantity || 0)
          .div(sku.sale_ratio || 1)
          .toFixed(2),
      )
      .plus(
        Big(sku.real_refund_quantity || 0)
          .div(sku.sale_ratio || 1)
          .toFixed(2),
      ),
  )
  if (sku.weighted || sku.out_of_stock) {
    q = sku.actual_quantity || 0
  }
  return q
}

export {
  getActualQuantity,
  isOrderDistributing,
  getFirstPinYinCharCode,
  sortByFirstLetterBase,
  getSkusPrice,
  findItemFromType,
  mapForChange,
  getInfoOfOrderSkus,
  isSkusOrCombineGoodsOrder,
  getSkusQuantity,
}
