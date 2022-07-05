import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import { Price } from '@gmfe/react'
import Big from 'big.js'

const InStockMoneyNoTaxCell = observer(({ data }) => {
  const { instock_money_no_tax } = data
  if (isNil(instock_money_no_tax)) {
    return '-'
  }
  return (
    <>
      {Big(instock_money_no_tax).toFixed(2)}
      {Price.getUnit()}
    </>
  )
})

InStockMoneyNoTaxCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.object.isRequired,
}

export default memoComponentWithDataHoc(InStockMoneyNoTaxCell)
