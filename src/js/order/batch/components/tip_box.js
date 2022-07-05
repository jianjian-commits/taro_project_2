import React from 'react'
import { Flex } from '@gmfe/react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

const TipBox = ({ tip, others, style, className }) => {
  return (
    <Flex
      alignCenter
      className={classNames('gm-padding-10', className)}
      style={style}
    >
      <Flex className='b-warning-tips'>
        <i className='ifont xfont-warning-circle' />
        {tip}
      </Flex>
      {others}
    </Flex>
  )
}

TipBox.propTypes = {
  tip: PropTypes.string,
  others: PropTypes.element,
  style: PropTypes.object,
  className: PropTypes.string,
}

export default TipBox
