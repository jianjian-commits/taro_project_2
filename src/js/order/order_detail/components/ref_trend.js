import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import Big from 'big.js'

const RefTrend = (props) => {
  const { sku, refPrice, viewType } = props
  if (sku.id === null) {
    return null
  }
  const isTiming = sku.is_price_timing && !sku.total_item_price
  let stdSalePrice = sku.std_sale_price

  if (viewType !== 'view' && sku.sale_price !== null) {
    stdSalePrice = Big(+sku.sale_price * 100)
      .div(sku.sale_ratio)
      .toFixed(2)
  }
  let trend =
    isTiming || !refPrice || stdSalePrice === undefined
      ? 0
      : Big(+stdSalePrice - refPrice).div(100)

  if (trend === 0) return null
  return trend < 0 ? (
    <Popover
      showArrow
      type='hover'
      popup={
        <div className='gm-padding-5'>{i18next.t('此商品属于负毛利状态')}</div>
      }
    >
      <i className='glyphicon glyphicon-arrow-down text-primary' />
    </Popover>
  ) : null
}

RefTrend.displayName = 'RefTrend'
RefTrend.propTypes = {
  refPrice: PropTypes.number,
  sku: PropTypes.object,
  viewType: PropTypes.string,
}

export default RefTrend
