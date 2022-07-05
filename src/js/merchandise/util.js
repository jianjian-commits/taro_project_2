import Big from 'big.js'
import _ from 'lodash'
import { Price } from '@gmfe/react'
import { isNumber } from '../common/util'

import { i18next } from 'gm-i18n'
import globalStore from '../stores/global'

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
}

const smartPriceWarningTips = (
  min,
  max,
  std_unit_name_forsale,
  fee_type = null,
) => {
  if (_.isNull(min)) {
    return i18next.t(
      /* src:'当前商品建议定价区间<=' + Big(max).div(100).toFixed(2) => tpl:当前商品建议定价区间<=${VAR1} */ 'KEY281',
      {
        VAR1: Big(max).div(100).toFixed(2),
      },
    )
  } else if (_.isNull(max)) {
    return i18next.t(
      /* src:'当前商品建议定价区间>=' + Big(min).div(100).toFixed(2) => tpl:当前商品建议定价区间>=${VAR1} */ 'KEY282',
      {
        VAR1: Big(min).div(100).toFixed(2),
      },
    )
  } else {
    return i18next.t(
      /* src:'当前商品建议定价区间为' + Big(min).div(100).toFixed(2) + '元/' + std_unit_name_forsale + '~' + Big(max).div(100).toFixed(2) + '元/' + std_unit_name_forsale => tpl:当前商品建议定价区间为${VAR1}/${VAR2}~${VAR3}/${VAR4} */ 'KEY283',
      {
        VAR1: Big(min).div(100).toFixed(2) + Price.getUnit(fee_type),
        VAR2: std_unit_name_forsale,
        VAR3: Big(max).div(100).toFixed(2) + Price.getUnit(fee_type),
        VAR4: std_unit_name_forsale,
      },
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

const turnoverFileds = [
  'bind_turnover',
  'tid',
  'turnover_bind_type',
  'turnover_ratio',
]
const addTurnOverFields = (to, from) => {
  const params = _.pick(from, turnoverFileds)
  return _.assign({}, to, params)
}
const initTurnOverFields = (target) => {
  target['bind_turnover'] = 0
  target['turnover_bind_type'] = 1
  target['tid'] = ''
  target['turnover_ratio'] = ''
}

const pennyToYuan = (val) =>
  _.trim(val) === '' ? null : Big(val).times(100).toFixed()

const getOptionalMeasurementUnitList = (unitName) => {
  if (!unitName) return []
  const optionalMeasurementUnitList = globalStore.measurementUnitList[unitName]
  if (!optionalMeasurementUnitList) return []

  return _.map(optionalMeasurementUnitList, (v) => {
    return {
      value: v.std_unit_name_forsale,
      text: v.std_unit_name_forsale,
      ratio: v.std_ratio,
    }
  })
}

const getFirstMeasurementUnit = (unitName) => {
  if (!unitName) return ''

  return getOptionalMeasurementUnitList(unitName)[0].text
}

/**
 * 获取默认供应商和其他供应商
 * @param {array} data 列表数据
 * @param {string} id 默认供应商的id
 */
const getSupplierList = (data, id) => {
  // 默认供应商
  const supplierList = []

  _.forEach(data, (item) => {
    if (_.some(item.merchandise, (i) => i === id)) {
      supplierList.push(item)
    }
  })
  // 其他供应商
  const otherSupplierList = _.differenceBy(data, supplierList, (v) => v.value)

  return { supplierList, otherSupplierList }
}
export {
  ENUM,
  ENUMFilter,
  smartPriceWarningTips,
  getOverSuggestPrice,
  addTurnOverFields,
  initTurnOverFields,
  pennyToYuan,
  getOptionalMeasurementUnitList,
  getFirstMeasurementUnit,
  getSupplierList,
}
