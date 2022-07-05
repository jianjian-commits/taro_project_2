import React from 'react'
import PropTypes from 'prop-types'
import store from '../store/receipt_store'
import { isNil } from 'lodash'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Price } from '@gmfe/react'

const OutStockMoneyNoTaxCell = observer(({ index }) => {
  const { outStockList } = store
  const { out_stock_money_no_tax } = outStockList[index]
  if (isNil(out_stock_money_no_tax)) {
    return '-'
  }

  return (
    <>
      {Big(out_stock_money_no_tax).toFixed(2)}
      {Price.getUnit()}
    </>
  )
})

OutStockMoneyNoTaxCell.propTypes = {
  index: PropTypes.number,
}

export default OutStockMoneyNoTaxCell
