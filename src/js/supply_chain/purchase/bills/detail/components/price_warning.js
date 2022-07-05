import React from 'react'
import { Popover, Price } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'

const PriceWarning = (props) => {
  const { supplier_purchase_avg_price, purchase_price, std_unit_name } = props

  if (
    !supplier_purchase_avg_price ||
    +supplier_purchase_avg_price >= parseFloat(purchase_price)
  )
    return null
  else
    return (
      <Popover
        showArrow
        type='hover'
        popup={
          <div className='gm-paddind-5' style={{ minWidth: '100px' }}>
            <div className='gm-text-red gm-text-12 gm-padding-5'>
              {`${i18next.t(
                '近七天采购均价',
              )}=${supplier_purchase_avg_price}${Price.getUnit()}/${std_unit_name}`}
            </div>
            <div className='gm-padding-5 gm-padding-top-0'>
              {i18next.t('当前采购单价已超出，请关注预警商品')}
            </div>
          </div>
        }
      >
        <i className='ifont xfont-warning-circle gm-text-red' />
      </Popover>
    )
}

PriceWarning.propTypes = {
  supplier_purchase_avg_price: PropTypes.string,
  purchase_price: PropTypes.string,
  std_unit_name: PropTypes.string,
}

export default PriceWarning
