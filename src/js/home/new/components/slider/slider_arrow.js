import React from 'react'
import { Flex } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import SvgSliderArrow from 'svg/slider_arrow.svg'
import SvgSliderArrowD from 'svg/slider_arrow_d.svg'

const SliderArrow = ({ right, left, disabled, onClick }) => {
  const handleClick = (direction) => {
    if (disabled) return
    onClick(direction)
  }
  return (
    <Flex
      column
      justifyCenter
      className={classNames({
        'gm-margin-right-15': left,
        'gm-margin-left-15': right,
      })}
    >
      {right ? (
        <div
          className={classNames({
            'gm-text-desc': disabled,
            'gm-cursor': !disabled,
          })}
          onClick={() => handleClick(-1)}
        >
          {disabled ? (
            <SvgSliderArrowD className='gm-text-20' />
          ) : (
            <SvgSliderArrow className='gm-text-20' />
          )}
        </div>
      ) : (
        <div
          className={classNames({
            'gm-text-desc': disabled,
            'gm-cursor': !disabled,
          })}
          style={{
            transform: 'rotate(180deg)',
          }}
          onClick={() => handleClick(1)}
        >
          {disabled ? (
            <SvgSliderArrowD className='gm-text-20' />
          ) : (
            <SvgSliderArrow className='gm-text-20' />
          )}
        </div>
      )}
    </Flex>
  )
}

SliderArrow.propTypes = {
  right: PropTypes.bool,
  left: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
}
export default SliderArrow
