import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import _ from 'lodash'

const LowerSalepriceArrow = (props) => {
  const { sku, refPrice, viewType } = props

  if (sku.id === null) {
    return null
  }
  const isTiming = sku.is_price_timing && !sku.total_item_price
  let stdSalePrice = 0

  if (!_.isNil(sku.sale_price)) {
    stdSalePrice = Big(+sku.sale_price * 100)
      .div(sku.sale_ratio || 1)
      .toFixed(2)
  }
  const trend =
    isTiming || !refPrice || stdSalePrice === undefined
      ? 0
      : Big(+stdSalePrice - refPrice).div(100)
  if (trend >= 0) return null
  return (
    <Popover
      showArrow
      type='hover'
      popup={
        <div className='gm-padding-5'>{i18next.t('价格低于参考成本')}</div>
      }
    >
      <i
        className='glyphicon glyphicon-arrow-down'
        style={{ color: '#bfe97f' }}
      />
    </Popover>
  )
}

LowerSalepriceArrow.displayName = 'LowerSalepriceArrow'
LowerSalepriceArrow.propTypes = {
  refPrice: PropTypes.number,
  sku: PropTypes.object,
  viewType: PropTypes.string,
}

export default LowerSalepriceArrow
