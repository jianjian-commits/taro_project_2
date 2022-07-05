import React from 'react'
import store from '../store'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import Big from 'big.js'

const TaxRateCell = observer(({ index }) => {
  const { tasks } = store
  const { tax_rate } = tasks[index]
  if (isNil(tax_rate)) {
    return '-'
  }
  return <>{Big(tax_rate).div(100).toFixed(2)}%</>
})

TaxRateCell.propTypes = {
  index: PropTypes.number,
}

export default TaxRateCell
