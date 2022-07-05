import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import _ from 'lodash'

const Item = (props) => {
  const { title, action, totalNumber, totalUnit, isMainColor } = props

  const textColor = isMainColor ? { color: '#007EFF' } : {}

  return (
    <Flex justifyCenter alignCenter column className='b-page-total-data-item'>
      <div>
        <Flex row alignCenter>
          <div>{title}</div>
          <div className='gm-gap-5' />
          <div>{action}</div>
        </Flex>
        <Flex row alignEnd style={textColor} className='gm-text-bold'>
          <span className='b-page-total-data-item-number gm-number-family'>
            {totalNumber}
          </span>
          <div className='gm-gap-5' />
          <span style={{ fontSize: '16px' }}>{totalUnit}</span>
        </Flex>
      </div>
    </Flex>
  )
}

Item.propTypes = {
  title: PropTypes.string,
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  totalNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalUnit: PropTypes.string,
  isMainColor: PropTypes.bool,
}

const PageTotalData = (props) => {
  const { data } = props

  return (
    <Flex row alignCenter className='b-page-total-data'>
      {_.map(data, (item, index) => {
        return (
          <>
            {index === 1 && <div className='b-page-total-data-tag' />}
            <Item
              title={item.title}
              action={item.action}
              totalNumber={item.totalNumber}
              totalUnit={item.totalUnit}
              isMainColor={item.isMainColor}
            />
          </>
        )
      })}
    </Flex>
  )
}

PageTotalData.propTypes = {
  /** @type {[ {title: string, action: string | element, totalNumber: number | string, totalUnit: string, isMainColor: bool} ] } */
  data: PropTypes.array.isRequired,
}

export default PageTotalData
