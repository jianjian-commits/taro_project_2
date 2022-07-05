import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_hoc'
import { observer } from 'mobx-react'
import { Price } from '@gmfe/react'

const EditCellPrice = observer(props => {
  const { sku_id, sale_price, fee_type, sale_unit_name } = props.data
  if (!sku_id) return '-'
  return (
    <span>{sale_price + Price.getUnit(fee_type) + '/' + sale_unit_name}</span>
  )
})

EditCellPrice.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
}

export default memoComponentWithDataHoc(EditCellPrice)
