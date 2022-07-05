import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_hoc'
import { observer } from 'mobx-react'
import { saleState } from '../../../../../common/filter'

const EditCellState = observer(props => {
  const { state, sku_id } = props.data
  if (!sku_id) return '-'
  return <span>{saleState(state)}</span>
})

EditCellState.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
}

export default memoComponentWithDataHoc(EditCellState)
