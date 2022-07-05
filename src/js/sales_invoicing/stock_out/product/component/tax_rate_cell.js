import React from 'react'
import PropTypes from 'prop-types'
import store from '../store/receipt_store'
import { isNil } from 'lodash'
import { observer } from 'mobx-react'
import Big from 'big.js'

const TaxRateCell = observer(({ index }) => {
  const { outStockList } = store
  const { tax_rate } = outStockList[index]
  if (isNil(tax_rate)) {
    return '-'
  }

  return <>{Big(tax_rate).div(100).toFixed(2)}%</>
})

TaxRateCell.propTypes = {
  index: PropTypes.number,
}

export default TaxRateCell
