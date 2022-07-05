import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import { isNil } from 'lodash'
import Big from 'big.js'

const TaxRateCell = observer(({ data }) => {
  const { tax_rate } = data
  if (isNil(tax_rate)) {
    return '-'
  }
  return <>{Big(tax_rate).div(100).toFixed(2)}%</>
  /*
  const { tax_rate } = cellProps.row.original
              if (isNil(tax_rate)) {
                return '-'
              }
              return `${Big(tax_rate)
                .div(100)
                .toFixed(2)}%`
   */
})

TaxRateCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(TaxRateCell)
