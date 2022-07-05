/**
 * @description: 渲染最大任务数单元格
 */
import React from 'react'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'

function RenderMaxValue(props) {
  const { index, value, disabled, rowsSize, onChange } = props
  if (index === rowsSize - 1) {
    return '-'
  }
  return (
    <KCInputNumberV2
      style={{ width: '80px' }}
      min={0.0}
      precision={2}
      onChange={(num) => onChange('value', num, index)}
      value={value}
      disabled={disabled}
    />
  )
}
RenderMaxValue.propTypes = {
  index: PropTypes.number.isRequired,
  rowsSize: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default RenderMaxValue
