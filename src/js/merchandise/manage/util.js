import { i18next } from 'gm-i18n'
import { Price } from '@gmfe/react'
import _ from 'lodash'
import { saleReferencePrice } from '../../common/enum'
import Big from 'big.js'
import { isNumber } from '../../common/util'
import { System } from '../../common/service'

const ENUM = {
  dispatchMethod: {
    1: i18next.t('按订单投框'),
    2: i18next.t('按司机投框'),
  },
  scopeTypes: [
    {
      value: 0,
      name: i18next.t('默认'),
    },
    {
      value: 1,
      name: i18next.t('价格区间筛选'),
    },
    {
      value: 2,
      name: i18next.t('阶梯价格区间筛选'),
    },
  ],
  formulaTypes: [
    {
      value: 1,
      name: i18next.t('预设公式定价'),
    },
    {
      value: 3,
      name: i18next.t('预设公式定价（阶梯区间）'),
    },
    {
      value: 2,
      name: i18next.t('自定义公式'),
    },
  ],
  priceTypes: [
    {
      value: 0,
      name: i18next.t('现单价'),
    },
    {
      value: 1,
      name: i18next.t('供应商最近询价'),
    },
    {
      value: 2,
      name: i18next.t('供应商最近采购价'),
    },
    {
      value: 3,
      name: i18next.t('供应商最近入库价'),
    },
    {
      value: 4,
      name: i18next.t('库存均价'),
    },
    {
      value: 5,
      name: i18next.t('最近询价'),
    },
    {
      value: 6,
      name: i18next.t('最近入库价'),
    },
  ],
  calTypes: [
    {
      value: 0,
      name: i18next.t('加'),
    },
    {
      value: 1,
      name: i18next.t('乘'),
    },
    {
      value: 2,
      name: i18next.t('除'),
    },
  ],
  remarkTypes: {
    2: i18next.t('净菜'),
    3: i18next.t('便当'),
    4: i18next.t('组合商品'),
    5: i18next.t('餐具'),
    6: i18next.t('包装材料'),
    7: i18next.t('毛菜'),
  },
  stockTypes: [
    { value: 1, name: i18next.t('不限制库存') },
    { value: 2, name: i18next.t('设置固定库存') },
    { value: 3, name: i18next.t('限制库存') },
  ],
}

const ENUMFilter = {
  dispatchMethod(name) {
    return ENUM.dispatchMethod[name]
  },
  priceType(value) {
    return _.find(ENUM.priceTypes, (v) => v.value === value).name
  },
  calType(value, num) {
    switch (value) {
      case 0:
        return num < 0 ? '-' + Math.abs(num) : '+' + Math.abs(num)
      case 1:
        return '*' + num
      case 2:
        return '÷' + num
    }
  },
  stockType(type) {
    const select = _.find(ENUM.stockTypes, { value: type })
    if (type === 0) return i18next.t('读取上游库存')
    else return select.name
  },
}

const getRefParams = (reference_price_type) => {
  let referencePriceName = ''
  let referencePriceFlag = ''
  _.find(saleReferencePrice, (item) => {
    if (item.type === reference_price_type) {
      referencePriceName = item.name
      referencePriceFlag = item.flag

      return true
    }
  })

  return { referencePriceFlag, referencePriceName }
}

const smartPriceWarningTips = (
  min,
  max,
  std_unit_name_forsale,
  fee_type = null
) => {
  if (_.isNull(min)) {
    return i18next.t(
      /* src:'当前商品建议定价区间<=' + Big(max).div(100).toFixed(2) => tpl:当前商品建议定价区间<=${VAR1} */ 'KEY281',
      {
        VAR1: Big(max).div(100).toFixed(2),
      }
    )
  } else if (_.isNull(max)) {
    return i18next.t(
      /* src:'当前商品建议定价区间>=' + Big(min).div(100).toFixed(2) => tpl:当前商品建议定价区间>=${VAR1} */ 'KEY282',
      {
        VAR1: Big(min).div(100).toFixed(2),
      }
    )
  } else {
    return i18next.t(
      /* src:'当前商品建议定价区间为' + Big(min).div(100).toFixed(2) + '元/' + std_unit_name_forsale + '~' + Big(max).div(100).toFixed(2) + '元/' + std_unit_name => tpl:当前商品建议定价区间为${VAR1}/${VAR2}~${VAR3}/${VAR4} */ 'KEY283',
      {
        VAR1: Big(min).div(100).toFixed(2) + Price.getUnit(fee_type),
        VAR2: std_unit_name_forsale,
        VAR3: Big(max).div(100).toFixed(2) + Price.getUnit(fee_type),
        VAR4: std_unit_name_forsale,
      }
    )
  }
}

const getOverSuggestPrice = (val, min, max) => {
  let over = false

  if (!isNumber(val)) {
    over = false
  } else if (
    _.isNull(min) &&
    isNumber(max) &&
    Big(val).div(100).gt(Big(max).div(100))
  ) {
    over = true
  } else if (
    _.isNull(max) &&
    isNumber(min) &&
    Big(val).div(100).lt(Big(min).div(100))
  ) {
    over = true
  } else if (
    isNumber(max) &&
    isNumber(min) &&
    (Big(val).div(100).lt(Big(min).div(100)) ||
      Big(val).div(100).gt(Big(max).div(100)))
  ) {
    over = true
  } else {
    over = false
  }

  return over
}

const getQueryFilterForList = (filter) => {
  const {
    categoryFilter,
    salemenu_ids,
    query,
    formula,
    salemenu_is_active,
    has_images,
    is_price_timing,
    is_clean_food,
    process_label_id,
  } = filter
  let params = {
    category1_ids: JSON.stringify(
      _.map(categoryFilter.category1_ids, (v) => v.id)
    ),
    category2_ids: JSON.stringify(
      _.map(categoryFilter.category2_ids, (v) => v.id)
    ),
    pinlei_ids: JSON.stringify(_.map(categoryFilter.pinlei_ids, (v) => v.id)),
    salemenu_ids: JSON.stringify(_.map(salemenu_ids, (v) => v.id)),
    q: query,
  }
  if (formula !== -1) params = Object.assign({}, params, { formula })
  if (salemenu_is_active !== -1)
    params = Object.assign({}, params, { salemenu_is_active })
  if (has_images !== -1) params = Object.assign({}, params, { has_images })
  if (is_price_timing !== -1) {
    params = Object.assign({}, params, { is_price_timing })
  }
  if (is_clean_food !== -1) {
    // -1是全部
    params = Object.assign({}, params, { is_clean_food })
  }
  if (process_label_id !== 0) {
    // 0是无
    params = Object.assign({}, params, { process_label_id })
  }
  if (System.isC()) params.is_retail_interface = 1
  return params
}

const filterSkuByFeeType = (skus, fee_type, isSelected = false) => {
  let skuIds = []
  if (isSelected) {
    skuIds = _.map(skus, (v) => {
      if (v.fee_type === fee_type) return v.sku_id
    })
  } else {
    skuIds = _.map(skus, (v) => {
      if (v.fee_type === fee_type) return v.sku_id
    })
  }
  return _.filter(skuIds, (s) => !!s)
}

const getSkuPriceRange = (skus) => {
  const arr = _.groupBy(skus, 'fee_type')
  return _.map(arr, (val, k) => {
    let min = 0
    let max = 0
    if (val.length !== 0) {
      min = Big(_.min(_.map(val, (v) => v.std_sale_price_forsale)))
        .div(100)
        .toFixed(2)
      max = Big(_.max(_.map(val, (v) => v.std_sale_price_forsale)))
        .div(100)
        .toFixed(2)
    }
    return {
      min,
      max,
      fee_type: k,
    }
  })
}

export {
  ENUM,
  ENUMFilter,
  getRefParams,
  smartPriceWarningTips,
  getOverSuggestPrice,
  getQueryFilterForList,
  filterSkuByFeeType,
  getSkuPriceRange,
}
