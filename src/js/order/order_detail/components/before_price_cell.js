import { i18next } from 'gm-i18n'
import React from 'react'
import { Price } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import store from '../../store'

const BeforePriceCell = (props) => {
  const { rowData, index, isDetail, disabled } = props

  const {
    before_change_price_forsale,
    fee_type,
    sale_unit_name,
    yx_price,
    rule_type,
  } = rowData

  const onChange = (value) => {
    store.onRowChange(index, 'before_change_price_forsale', value)
    if (yx_price && rule_type) {
      const sale_price = Big(value || 0)
        .times(yx_price)
        .div(100)
        .toFixed(2)
      store.onRowChange(index, 'sale_price', Number(sale_price))
    }
  }

  return (
    <div>
      {isDetail ? (
        before_change_price_forsale
      ) : (
        <KCInputNumberV2
          value={before_change_price_forsale}
          onChange={onChange}
          style={{ width: '80px' }}
          placeholder={i18next.t('单价')}
          min={0}
          max={999999}
          disabled={disabled}
          className='form-control gm-inline'
        />
      )}

      <span className='gm-padding-left-5'>
        {before_change_price_forsale ? Price.getUnit(fee_type) : '-'}
        {'/'}
        {before_change_price_forsale ? sale_unit_name : '-'}
      </span>
    </div>
  )
}

BeforePriceCell.propTypes = {
  rowData: PropTypes.object,
  isDetail: PropTypes.bool,
  index: PropTypes.number,
  disabled: PropTypes.bool,
}

export default observer(BeforePriceCell)
