import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_hoc'
import { observer } from 'mobx-react'
import { InputNumberV2 } from '@gmfe/react'

import store from '../store'

const EditCellPerLimit = observer((props) => {
  const { index } = props
  const { per_limit, sku_id } = props.data
  const handleInput = (value) => {
    store.changeListItem(index, { per_limit: value })
  }

  if (!sku_id) return '-'
  return (
    <InputNumberV2
      min={0}
      precision={0}
      value={per_limit}
      onChange={handleInput}
    />
  )
})

EditCellPerLimit.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(EditCellPerLimit)
