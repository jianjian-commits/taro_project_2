import React from 'react'
import store from '../store'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import Big from 'big.js'
import { Price } from '@gmfe/react'

const PurchaseMoneyNoTaxCell = observer(({ index }) => {
  const { tasks } = store
  const { purchase_money_no_tax } = tasks[index]
  if (isNil(purchase_money_no_tax)) {
    return '-'
  }
  return (
    <>
      {Big(purchase_money_no_tax).toFixed(2)}
      {Price.getUnit()}
    </>
  )
})

PurchaseMoneyNoTaxCell.propTypes = {
  index: PropTypes.number,
}

export default PurchaseMoneyNoTaxCell
