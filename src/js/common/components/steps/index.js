import React, { useState, useImperativeHandle, forwardRef } from 'react'
import _ from 'lodash'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './style.less'

const Steps = ({ steps, defaultActive }, ref) => {
  const [active, setActive] = useState(defaultActive || steps[0].value)

  useImperativeHandle(
    ref,
    () => {
      return {
        setSelected: (value) => {
          const target = _.find(steps, (tab) => tab.value === value)
          if (!target) throw Error('no item')
          setActive(value)
        },
      }
    },
    [steps],
  )

  const stepsChildren = () => {
    const item = _.find(steps, (tab) => tab.value === active)
    return <>{item && item.children}</>
  }
  return (
    <Flex flex column>
      <Flex row className='b-customize-step-header'>
        {_.map(steps, (v, i) => (
          <Flex flex>
            <Flex
              flex
              alignCenter
              justifyCenter
              className={classNames('b-customize-step-header-step', {
                active: active === v.value,
              })}
            >
              {v.text}
            </Flex>
            {i !== steps.length - 1 && (
              <div
                className={classNames('b-customize-step-header-triangle', {
                  active: active === v.value,
                })}
              />
            )}
          </Flex>
        ))}
      </Flex>
      <Flex flex column className='gm-padding-20 gm-margin-top-20'>
        {stepsChildren()}
      </Flex>
    </Flex>
  )
}

/**
 * text: string
 * value: string
 * children: ReactNode
 */
Steps.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.object).isRequired,
  defaultActive: PropTypes.string,
}

export default forwardRef(Steps)
