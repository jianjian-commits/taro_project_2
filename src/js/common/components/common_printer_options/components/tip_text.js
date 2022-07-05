import React from 'react'
import PropTypes from 'prop-types'

const TipText = ({ text }) =>
  text ? <div className='gm-padding-10'>{text}</div> : null

TipText.propTypes = {
  text: PropTypes.string,
}

export default React.memo(TipText)
