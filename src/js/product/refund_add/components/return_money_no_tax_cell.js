import React from 'react'
import PropTypes from 'prop-types'
import store from '../store'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import Big from 'big.js'
import { Price } from '@gmfe/react'

const ReturnMoneyNoTaxCell = observer(({ index }) => {
  const {
    data: { details },
  } = store
  const { return_money_no_tax } = details[index]

  if (isNil(return_money_no_tax)) {
    return '-'
  }
  return (
    <>
      {Big(return_money_no_tax).toFixed(2)}
      {Price.getUnit()}
    </>
  )
})

ReturnMoneyNoTaxCell.propTypes = {
  index: PropTypes.number,
}

export default ReturnMoneyNoTaxCell
