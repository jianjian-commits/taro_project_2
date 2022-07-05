import React from 'react'
import PropTypes from 'prop-types'

// 投屏模式 各模块的边框组件
const FourCornerBorder = (props) => {
  const { children, width, height, style } = props
  return (
    <div
      className='b-border-content'
      style={{ width: width, height: height, ...style }}
    >
      <div className='b-angle-border b-left-top-border' />
      <div className='b-angle-border b-right-top-border' />
      <div className='b-angle-border b-left-bottom-border' />
      <div className='b-angle-border b-right-bottom-border' />
      <div>{children}</div>
    </div>
  )
}

FourCornerBorder.propTypes = {
  children: PropTypes.element,
  width: PropTypes.string,
  height: PropTypes.string,
  style: PropTypes.object,
}

export default FourCornerBorder
