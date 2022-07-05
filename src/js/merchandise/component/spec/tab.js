import React, { useState, useMemo } from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'

const Tab = ({ tabs, onChange, className, active, children, ...rest }) => {
  const [index, setIndex] = useState(active)

  const handleTabClick = (tab, index) => {
    setIndex(index)
    onChange && onChange(tab, index)
  }

  const activePanel = useMemo(() => {
    return React.cloneElement(children[index], { ...rest })
  }, [index])

  return (
    <Flex
      className={classNames('b-sepc-tabs', className)}
      justifyAround
      column
      {...rest}
    >
      <Flex className='gm-padding-lr-20'>
        {_.map(tabs, (tab, i) => (
          <Flex
            key={i}
            flex
            justifyAround
            onClick={() => handleTabClick(tab, i)}
            className={classNames(
              'gm-text-16 gm-cursor gm-padding-10 tab',
              { active: index === i },
              { 'gm-margin-left-10': i !== 0 },
            )}
          >
            {tab}
          </Flex>
        ))}
      </Flex>
      <div>{activePanel}</div>
    </Flex>
  )
}
Tab.propTypes = {
  children: PropTypes.array,
  className: PropTypes.string,
  active: PropTypes.number,
  tabs: PropTypes.array,
  onChange: PropTypes.func,
}
Tab.defaultProps = {
  active: 0,
}

export default Tab
