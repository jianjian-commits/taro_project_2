import React from 'react'
import PropTypes from 'prop-types'

const HoverTips = (props) => {
  return (
    <div
      className='gm-padding-10 gm-bg'
      style={{ minWidth: '160px', color: '#333' }}
    >
      {props.text}
    </div>
  )
}

HoverTips.propTypes = {
  text: PropTypes.string.isRequired,
}

export default HoverTips
