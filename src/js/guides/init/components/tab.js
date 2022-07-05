import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import _ from 'lodash'
import classNames from 'classnames'
import Video from './video'

const Tab = ({ data }) => {
  const [active, setActive] = useState(data[0] && data[0].label ? 1 : 0)

  const item = data[active]

  return (
    <Flex className='b-init-tab'>
      <Flex column none className='gm-back-bg' style={{ width: '220px' }}>
        {_.map(data, (v, i) =>
          v.label ? (
            <Flex
              none
              key={i}
              alignCenter
              className={classNames('b-init-tab-label gm-border-bottom')}
            >
              {v.label}
            </Flex>
          ) : (
            <Flex
              none
              key={i}
              alignCenter
              className={classNames('b-init-tab-title', {
                active: i === active,
              })}
              onMouseEnter={() => {
                setActive(i)
              }}
            >
              {v.title}
            </Flex>
          )
        )}
      </Flex>
      <Flex flex column className='gm-padding-20'>
        {item.video && (
          <div className='gm-margin-bottom-20'>
            <Video src={item.video} />
          </div>
        )}
        {item.desc && <div className='gm-margin-bottom-20'>{item.desc}</div>}
        {item.buttons && (
          <Flex>
            {_.map(item.buttons, (v, i) => (
              <div key={i} className='gm-margin-right-10'>
                {v}
              </div>
            ))}
          </Flex>
        )}
        {data[active].children}
      </Flex>
    </Flex>
  )
}

Tab.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      title: PropTypes.string,
      video: PropTypes.string,
      desc: PropTypes.any,
      buttons: PropTypes.array,
      children: PropTypes.element,
    })
  ),
}

export default Tab
