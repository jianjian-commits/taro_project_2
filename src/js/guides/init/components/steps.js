import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import _ from 'lodash'
import classNames from 'classnames'

const Steps = ({ step, onChange, data }) => {
  return (
    <Flex className='b-init-steps'>
      {_.map(data, (v, index) => (
        <Flex
          key={index}
          flex
          alignCenter
          className={classNames('b-init-steps-item', {
            active: index === step,
          })}
          onClick={() => onChange(index)}
        >
          <div className='b-init-steps-item-index gm-number-family'>
            {index + 1}
          </div>
          <Flex column>
            <div className='b-init-steps-item-title'>{v.title}</div>
            <div className='gm-padding-top-5' />
            <div className='b-init-steps-item-desc'>{v.desc}</div>
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

Steps.propTypes = {
  step: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      desc: PropTypes.string.isRequired,
    })
  ),
}

export default Steps
