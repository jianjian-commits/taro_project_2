import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const PanelLabel = (props) => {
  const { title, className, ...rest } = props

  return (
    <Flex {...rest} className={classNames('b-panel-label', className)}>
      <div className='b-panel-label-symbol' />
      <div className='b-panel-label-title'>{title}</div>
    </Flex>
  )
}

PanelLabel.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
}

export default PanelLabel
