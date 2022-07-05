import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import _ from 'lodash'

/*
data: [{label: '', content: ''},...]
 */

const TableTotalText = (props) => {
  const { data } = props
  const list = _.filter(data, (v) => !v.hide)

  return (
    <Flex row>
      {_.map(list, (item, index) => {
        return (
          <Flex alignCenter key={item.label + index}>
            {item.label}：
            <span className='text-primary gm-text-14 gm-text-bold'>
              {item.content}
            </span>
            {index < list.length - 1 && (
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

TableTotalText.propTypes = {
  data: PropTypes.array.isRequired,
}

export default TableTotalText
