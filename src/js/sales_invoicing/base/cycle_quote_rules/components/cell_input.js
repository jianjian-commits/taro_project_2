import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { KCInput } from '@gmfe/keyboard'
import store from '../store/detail'

function CellInput(props) {
  const { index, maxLength = 50, value = '', valueKey } = props
  function onChange(e) {
    store.changeSkuRow(index, { [valueKey]: e.target.value })
  }
  return (
    <KCInput
      type='text'
      className='form-control input-sm'
      maxLength={maxLength}
      value={value ?? ''}
      onChange={onChange}
    />
  )
}

CellInput.propTypes = {
  index: PropTypes.number.isRequired,
  maxLength: PropTypes.number,
  value: PropTypes.string,
  valueKey: PropTypes.string.isRequired,
}

export default memo(CellInput)
