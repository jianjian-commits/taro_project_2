import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_hoc'
import { observer } from 'mobx-react'
import { InputNumberV2 } from '@gmfe/react'

import store from '../store'

const EditCellFlashSaleStock = observer((props) => {
  const { index } = props
  const { flash_sale_stock, sku_id } = props.data
  const handleInput = (value) => {
    store.changeListItem(index, { flash_sale_stock: value })
  }

  if (!sku_id) return '-'
  return (
    <InputNumberV2
      min={1}
      precision={0}
      value={flash_sale_stock}
      onChange={handleInput}
    />
  )
})

EditCellFlashSaleStock.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(EditCellFlashSaleStock)
