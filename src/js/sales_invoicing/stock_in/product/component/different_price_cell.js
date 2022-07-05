import React from 'react'
import Big from 'big.js'
import { Price } from '@gmfe/react'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

const DifferentPriceCell = observer(({ data }) => {
  const { different_price } = data

  return (
    <span>
      {different_price === undefined
        ? '-'
        : Big(different_price || 0).toFixed(2) + Price.getUnit()}
    </span>
  )
})

DifferentPriceCell.propTypes = {
  data: PropTypes.object.isRequired,
}

export default memoComponentWithDataHoc(DifferentPriceCell)
