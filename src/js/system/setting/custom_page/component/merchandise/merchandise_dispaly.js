import React from 'react'
import classNames from 'classnames'
import { Flex } from '@gmfe/react'
import { skuLayoutType } from '../enum'
import _ from 'lodash'

class MerchandiseDisplay extends React.Component {
  render() {
    const { type } = this.props
    const isList = type === skuLayoutType.list
    const isAcross = type === skuLayoutType.across
    return (
      <Flex
        justifyBetween
        column={isList}
        row={isAcross}
        style={{ width: 160, height: 120 }}
      >
        {_.map(_.range(2), (v, i) => {
          return (
            <Flex
              key={i}
              flex
              row={isList}
              column={isAcross}
              style={i && isAcross && { marginLeft: 10 }}
            >
              <Flex
                className='b-diy-merchandise-img-wrap'
                style={isAcross && { height: 70 }}
              />
              <Flex
                column
                className={classNames('b-diy-merchandise-text', {
                  'b-diy-merchandise-across': isAcross,
                })}
              >
                <div className='b-diy-merchandise-name' />
                <div className='b-diy-merchandise-desc' />
              </Flex>
            </Flex>
          )
        })}
      </Flex>
    )
  }
}

export default MerchandiseDisplay
