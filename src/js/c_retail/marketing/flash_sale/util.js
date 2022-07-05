import _ from 'lodash'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Dialog, Tip } from '@gmfe/react'
import React from 'react'
import { PRICE_RULE_STATUS, RULE_TYPE } from '../../../common/enum'
import Big from 'big.js'

/**
 * 锁价规格:
 * rule_type(curSelected): 固定(0) | 加法(1)              | 乘法(2)
 * yx_price(curValue):     > 0    | 任何数(规则价要大于0)  | > 0
 */
const isInvalid = item =>
  item.yx_price === '-' || (item.rule_type !== 1 && item.yx_price < 0) // 注意的是: '' < 0 为true

const conflictAlert = json => {
  const keys = _.keys(json.data)
  const data = json.data[keys[0]]

  const ruleObject = data.skus.join(',')

  const children = (
    <div>
      <div className='b-word-break'>
        <strong>{t('商品ID')}：</strong>
        {ruleObject}
      </div>
      <div>
        <strong>{t('冲突日期')}：</strong>
        {moment(data.begin).format('YYYY-MM-DD HH:mm:ss')}
        {t('至')}
        {moment(data.end).format('YYYY-MM-DD HH:mm:ss')}
      </div>
    </div>
  )

  Dialog.alert({
    title: t('KEY120', {
      VAR1: keys[0]
    }) /* src:'与已有规则' + keys[0] + '冲突' => tpl:与已有规则${VAR1}冲突 */,
    children: children,
    size: 'md'
  })
}

const GET_STATUS = status => {
  const obj = _.find(PRICE_RULE_STATUS, v => v.id === status)
  return obj ? obj.name : '-'
}

const arrowUp = () => (
  <i className='glyphicon glyphicon-arrow-up' style={{ color: '#ff5454' }} />
)
const arrowDown = () => (
  <i className='glyphicon glyphicon-arrow-down' style={{ color: '#bdea74' }} />
)

const ruleTypeMap = {
  FIXED_VALUE: 0,
  VARIATION: 1,
  MULTIPLE: 2
}

const getSku = (skuList) => {
  if (!skuList.length) {
    Tip.warning(t('请选择商品！'))
    return { inValid: true }
  }
  let tip = ''
  const inValidSku = _.find(skuList, function (sku) {
    if (sku.yx_price === '') {
      tip = sku.sku_id + t('此商品计算规则不能为空')
      return true
    } else if (isInvalid(sku)) {
      tip = sku.sku_id + t('此商品的规则只能输入大于0的数')
      return true
    } else if (
      sku.rule_type === 1 &&
      Big(sku.sale_price).plus(sku.yx_price).lt(0)
    ) {
      tip = sku.sku_id + t('的规则价小于0,请重新输入!')
      return true
    }
  })

  if (inValidSku) {
    Tip.warning(tip)
    return { inValid: true }
  } else {
    const skus = skuList.map((sku) => ({
      sku_id: sku.sku_id,
      yx_price: sku.yx_price,
      rule_type: sku.rule_type,
      flash_sale_stock: sku.flash_sale_stock,
      per_limit: sku.per_limit,
    }))
    return { skus: JSON.stringify(skus) }
  }
}

const legitimate = any => {
  if (any === '' || any === '-') {
    return 0
  } else {
    return any
  }
}

const getRuleType = n => RULE_TYPE.find(o => o.value === n) || {}

export {
  conflictAlert,
  GET_STATUS,
  arrowUp,
  arrowDown,
  ruleTypeMap,
  getSku,
  legitimate,
  getRuleType
}
