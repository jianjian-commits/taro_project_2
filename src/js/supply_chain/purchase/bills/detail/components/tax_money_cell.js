import React from 'react'
import store from '../store'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import Big from 'big.js'
import { Price } from '@gmfe/react'

const TaxMoneyCell = observer(({ index }) => {
  const { tasks } = store
  const { tax_money } = tasks[index]
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
