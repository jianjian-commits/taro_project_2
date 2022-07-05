import React from 'react'
import PropTypes from 'prop-types'

function FieldBlock({ left, right, ...rest }) {
  return (
    <div {...rest}>
      {left}：{right}
    </div>
  )
}

FieldBlock.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
}

export default FieldBlock
