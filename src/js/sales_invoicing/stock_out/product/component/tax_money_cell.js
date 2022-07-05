import React from 'react'
import PropTypes from 'prop-types'
import store from '../store/receipt_store'
import { isNil } from 'lodash'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Price } from '@gmfe/react'

const TaxMoneyCell = observer(({ index }) => {
  const { outStockList } = store
  const { tax_money } = outStockList[index]
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
  index: PropTypes.number,
}

export default TaxMoneyCell
