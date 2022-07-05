import React from 'react'
import { i18next } from 'gm-i18n'
import { SvgPriceRule } from 'gm-svg'

const PriceRuleSkuIconTip = () => (
  <span title={i18next.t('此商品为锁价商品')}>
    <SvgPriceRule />
  </span>
)

export default PriceRuleSkuIconTip
