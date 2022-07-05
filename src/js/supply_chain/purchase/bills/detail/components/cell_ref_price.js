import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import PropTypes from 'prop-types'
import Big from 'big.js'
import { Price } from '@gmfe/react'

const CellRefPrice = observer((props) => {
  const { data, referencePriceFlag } = props
  // ref_price为0也要优先取ref_price
  const price = data.ref_price ?? data[referencePriceFlag]

  return (
    <span>
      {/* 价格为0要展示，而不是展示- */}
      {price || price === 0
        ? Big(price).div(100).toFixed(2) +
          Price.getUnit() +
          '/' +
          data.std_unit_name
        : '-'}
    </span>
  )
})

CellRefPrice.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  referencePriceFlag: PropTypes.string,
}

export default memoComponentWithDataHoc(CellRefPrice)
