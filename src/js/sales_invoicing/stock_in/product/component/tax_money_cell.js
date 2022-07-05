import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Price } from '@gmfe/react'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import { isNil } from 'lodash'

const TaxMoneyCell = observer(({ data }) => {
  const { tax_money } = data
  if (isNil(tax_money)) {
    return '-'
  }
  return (
    <>
      {Big(tax_money).toFixed(2)}
      {Price.getUnit()}
    </>
  )
})

TaxMoneyCell.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
}

export default memoComponentWithDataHoc(TaxMoneyCell)
