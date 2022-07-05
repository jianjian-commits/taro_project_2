import React from 'react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import PropTypes from 'prop-types'

const ScaleEditCell = ({ data, onChange, index, disabled }) => {
  const handleSelected = (value) => {
    onChange(value, index)
  }

  return (
    <KCInputNumberV2
      value={data.exchange_ratio}
      onChange={handleSelected}
      precision={0}
      min={0}
      disabled={disabled}
    />
  )
}

ScaleEditCell.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number,
  disabled: PropTypes.bool,
}

export default ScaleEditCell
