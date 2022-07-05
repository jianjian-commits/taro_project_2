import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'

const Label = ({ text }) => {
  return (
    <Flex column className='b-label-container'>
      <Flex className='b-card-label'>{text}</Flex>
      <Flex className='b-card-label-content'>
        <div className='b-card-label-left' />
        <div className='b-card-label-right' />
      </Flex>
    </Flex>
  )
}

Label.propTypes = {
  text: PropTypes.string,
  disabled: PropTypes.bool,
}

Label.defaultProps = {
  disabled: false,
}

export default Label
