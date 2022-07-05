import React from 'react'
import classNames from 'classnames'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'

const StateContainer = ({ status, children }) => {
  return (
    <Flex alignCenter className='gm-inline-block gm-margin-left-5'>
      <div
        className={classNames('gm-inline-block b-order-status-tag', {
          'gm-bg-primary': status !== 15,
        })}
      />
      <span className='gm-text-desc gm-text-12'>{children}</span>
    </Flex>
  )
}

StateContainer.propTypes = {
  status: PropTypes.number,
}

export default StateContainer
