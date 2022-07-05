import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import classNames from 'classnames'
import _ from 'lodash'
import SVGCompleted from 'svg/completed.svg'

const Step = (props) => {
  const { title, description, index, completed } = props

  return (
    <Flex row className='gm-steps-step'>
      <Flex column alignCenter className='gm-margin-right-10'>
        <Flex flex className='b-step-tag' />
        <Flex
          alignCenter
          justifyCenter
          className={classNames('b-step-icon', {
            'b-step-completed': completed,
          })}
        >
          {completed ? <SVGCompleted className='gm-text-white' /> : index}
        </Flex>
        <Flex flex className='b-step-tag' />
      </Flex>
      <Flex flex column className='gm-padding-10 b-step-content'>
        {title && (
          <div className='gm-steps-step-title gm-margin-bottom-5'>{title}</div>
        )}
        {description && (
          <div className='gm-steps-step-description'>{description}</div>
        )}
      </Flex>
    </Flex>
  )
}

Step.propTypes = {
  title: PropTypes.element,
  description: PropTypes.element,
  index: PropTypes.number.isRequired,
  completed: PropTypes.bool,
}

const Steps = (props) => {
  const { data, className, ...rest } = props

  const renderStep = () => {
    return _.map(data, (item, index) => {
      return (
        <Step
          index={index + 1}
          isFoot
          title={item.title}
          completed={
            _.isFunction(item.completed) ? item.completed() : item.completed
          }
          description={item.description}
          key={`step ${index}`}
        />
      )
    })
  }

  return (
    <div {...rest} className={classNames('gm-steps', className)}>
      {renderStep()}
    </div>
  )
}

Steps.propTypes = {
  /** @type {[ {title: string, description: string} ] } */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.element,
      completed: PropTypes.func,
      description: PropTypes.element,
    }),
  ).isRequired,
  className: PropTypes.string,
}

export default Steps
