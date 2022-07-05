import PropTypes from 'prop-types'
import React from 'react'

const Content = ({ title, children }) => {
  return (
    <div style={{ minHeight: '100px' }}>
      <div className='gm-text-20 gm-text-primary gm-padding-bottom-20'>
        {title}
      </div>
      <div className='gm-text-14'>{children}</div>
    </div>
  )
}

Content.propTypes = {
  title: PropTypes.string.isRequired,
}

export default Content
