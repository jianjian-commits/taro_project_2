import React from 'react'
import PropTypes from 'prop-types'
import { i18next } from 'gm-i18n'

function CyclePriceRequireLabel(props) {
  return (
    <>
      <span className='gm-text-red gm-text-16'>*</span>
      {i18next.t(props.label)}
    </>
  )
}

CyclePriceRequireLabel.propTypes = {
  label: PropTypes.string,
}

export default CyclePriceRequireLabel
