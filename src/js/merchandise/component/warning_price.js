import React from 'react'
import PropTypes from 'prop-types'
import { Popover } from '@gmfe/react'
import { smartPriceWarningTips } from '../util'

class WarningPrice extends React.Component {
  render() {
    const {
      over_suggest_price,
      price,
      suggest_price_max,
      std_unit_name_forsale,
      suggest_price_min,
      fee_type,
    } = this.props
    return over_suggest_price ? (
      <div className='gm-text-red'>
        {price}
        <Popover
          showArrow
          top
          component={<div />}
          type='hover'
          popup={
            <div
              className='gm-border gm-padding-5 gm-bg gm-text-12'
              style={{ width: '200px' }}
            >
              {smartPriceWarningTips(
                suggest_price_min,
                suggest_price_max,
                std_unit_name_forsale,
                fee_type
              )}
            </div>
          }
        >
          <i className='xfont xfont-warning-circle gm-margin-lr-5' />
        </Popover>
      </div>
    ) : (
      price
    )
  }
}

WarningPrice.propTypes = {
  over_suggest_price: PropTypes.bool.isRequired,
  price: PropTypes.string.isRequired,
  suggest_price_max: PropTypes.number,
  std_unit_name_forsale: PropTypes.string.isRequired,
  suggest_price_min: PropTypes.number,
  fee_type: PropTypes.string,
}
export default WarningPrice
