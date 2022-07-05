import React from 'react'
import { observer } from 'mobx-react'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'

const BatchPopover = observer((props) => {
  const { index } = props

  return <span style={{ padding: '5px 0 5px 10px' }}>{index + 1}</span>
})

BatchPopover.propTypes = {
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(BatchPopover)
