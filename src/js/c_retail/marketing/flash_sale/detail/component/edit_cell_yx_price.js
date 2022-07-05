import React from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { Price } from '@gmfe/react'
import { arrowDown, arrowUp, ruleTypeMap, legitimate } from '../../util'

const EditCellYXPrice = observer(props => {
  const { data } = props
  const {
    sku_id,
    rule_type,
    yx_price,
    sale_price,
    sale_unit_name,
    fee_type
  } = data
  if (!sku_id) return '-'

  let rule_price = yx_price
  let yxPriceDom = null
  let yxPriceArrowDom = null

  // 计算出规则价
  if (rule_type === ruleTypeMap.VARIATION) {
    rule_price = Big(sale_price)
      .plus(legitimate(yx_price))
      .toString()
  } else if (rule_type === ruleTypeMap.MULTIPLE) {
    rule_price = Big(sale_price)
      .times(legitimate(yx_price))
      .toFixed(2)
  }

  if (rule_price !== '' && !Big(legitimate(rule_price)).eq(sale_price)) {
    yxPriceArrowDom = Big(legitimate(rule_price)).gt(sale_price)
      ? arrowUp()
      : arrowDown()
  }

  if (rule_type === ruleTypeMap.FIXED_VALUE) {
    yxPriceDom = (
      <span>
        {rule_price && Big(rule_price).toFixed(2)}
        {Price.getUnit(fee_type) + '/'}
        {sale_unit_name} {yxPriceArrowDom}
      </span>
    )
  } else if (rule_type === ruleTypeMap.VARIATION) {
    yxPriceDom = (
      <span>
        {rule_price && Big(rule_price).toFixed(2)}
        {Price.getUnit(fee_type) + '/'}
        {sale_unit_name} {yxPriceArrowDom}
      </span>
    )
  } else if (rule_type === ruleTypeMap.MULTIPLE) {
    yxPriceDom = (
      <span>
        {rule_price && Big(rule_price).toFixed(2)}
        {Price.getUnit(fee_type) + '/'}
        {sale_unit_name} {yxPriceArrowDom}
      </span>
    )
  }

  return yxPriceDom
})

EditCellYXPrice.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
}

export default memoComponentWithDataHoc(EditCellYXPrice)
