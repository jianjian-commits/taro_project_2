import React from 'react'
import { observer } from 'mobx-react'

import skuStore from '../../sku_store'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import Big from 'big.js'

const CellRefType = observer((props) => {
  const { craftRefType } = skuStore
  const { data } = props
  const { ingredientRatioData } = data

  return (
    <span>
      {ingredientRatioData && ingredientRatioData[craftRefType]
        ? Big(ingredientRatioData[craftRefType] || 0)
            .times(100)
            .toFixed(2) + '%'
        : '-'}
    </span>
  )
})

CellRefType.propTypes = {
  data: PropTypes.object,
}

export default memoComponentWithDataHoc(CellRefType)
