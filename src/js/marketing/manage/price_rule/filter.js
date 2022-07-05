import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { RULE_TYPE } from 'common/enum'

const priceRuleTarget = (types, type) => {
  return _.find(types, (t) => t.id === type)
}

/*
 * id可能是站点id，可能是地址id
 * @param id: 'T234'---->'T234'
 *            '8753'---->'S0008753'
 * */
function Id2UniverseId(id) {
  if (id.indexOf('T') > -1) {
    return id
  } else {
    id = parseInt(id, 10)
    if (id > 1000000) {
      return 'S' + id
    } else {
      return 'S' + (1000000 + id + '').slice(1)
    }
  }
}

// 锁价规则类型
const ruleTypeName = (rule_type) => {
  switch (rule_type) {
    case 0:
      return i18next.t('固定价格')
    case 1:
      return i18next.t('价格变动')
    case 2:
      return i18next.t('倍数')

    default:
      return i18next.t('固定价格')
  }
}

const getRuleType = (n) => RULE_TYPE.find((o) => o.value === n) || {}

const legitimate = (any) => {
  if (any === '' || any === '-') {
    return 0
  } else {
    return any
  }
}

/**
 * 锁价规格:
 * rule_type(curSelected): 固定(0) | 加法(1)              | 乘法(2)
 * yx_price(curValue):     > 0    | 任何数(规则价要大于0)  | > 0
 */
const isInvalid = (item) =>
  item.yx_price === '-' || (item.rule_type !== 1 && item.yx_price < 0) // 注意的是: '' < 0 为true

// 同时倍数和价格存在,就fail
const isVariationMultipleFail = ({ variation = '', multiple = '' }) => {
  return variation !== '' && multiple !== ''
}

export {
  priceRuleTarget,
  Id2UniverseId,
  ruleTypeName,
  getRuleType,
  legitimate,
  isInvalid,
  isVariationMultipleFail,
}
