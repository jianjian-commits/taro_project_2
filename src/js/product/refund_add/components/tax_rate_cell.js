import React from 'react'
import PropTypes from 'prop-types'
import store from '../store'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import Big from 'big.js'

const TaxRateCell = ({ index }) => {
  const {
    data: { details },
  } = store
  const { tax_rate } = details[index]
  if (isNil(tax_rate)) {
    return '-'
  }
  return <>{Big(tax_rate).div(100).toFixed(2)}%</>
}

TaxRateCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(TaxRateCell)
