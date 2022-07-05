import React from 'react'
import { Flex } from '@gmfe/react'
import { adLayoutType } from '../enum'
import _ from 'lodash'
import classNames from 'classnames'
import PropTypes from 'prop-types'

class AdsLayer extends React.Component {
  render() {
    const { type, renderItem, display, old } = this.props
    let nums = 1
    if (type === adLayoutType.two) nums = 2
    if (type === adLayoutType.three) nums = 3
    if (nums === 3) {
      return (
        <Flex
          row
          className={classNames('b-diy-ads-list', {
            'gm-padding-lr-15': !old,
            'gm-padding-lr-10': old,
          })}
        >
          <Flex
            flex={1}
            className='b-diy-ads-item gm-overflow-hidden'
            style={{
              marginRight: display ? 5 : 2,
              maxHeight: '100%',
              borderRadius: old ? '' : '10px',
            }}
          >
            {renderItem && renderItem(0)}
          </Flex>
          <Flex flex={1} column>
            <Flex
              className='b-diy-ads-item gm-overflow-hidden'
              style={{
                borderRadius: old ? '' : '10px',
              }}
            >
              {renderItem && renderItem(1)}
            </Flex>
            <Flex
              className='b-diy-ads-item gm-margin-top-5 gm-overflow-hidden'
              style={{
                borderRadius: old ? '' : '10px',
              }}
            >
              {renderItem && renderItem(2)}
            </Flex>
          </Flex>
        </Flex>
      )
    } else {
      return (
        <Flex
          className={classNames('b-diy-ads-list', {
            'gm-padding-lr-15': !old,
            'gm-padding-lr-10': old,
          })}
        >
          {_.map(_.range(nums), (v, i) => {
            return (
              <Flex
                column
                key={i}
                style={{
                  marginRight: i === 0 && nums !== 1 ? (display ? 5 : 2) : '',
                  borderRadius: old ? '' : '10px',
                }}
                flex={type !== adLayoutType.three}
                className='b-diy-ads-item gm-overflow-hidden'
              >
                {renderItem && renderItem(i)}
              </Flex>
            )
          })}
        </Flex>
      )
    }
  }
}

AdsLayer.propTypes = {
  type: PropTypes.oneOf([
    adLayoutType.one,
    adLayoutType.two,
    adLayoutType.three,
  ]),
  renderItem: PropTypes.func,
  display: PropTypes.bool,
  // 暂时添加旧ui样式，全量时全部删除
  old: PropTypes.bool,
}

AdsLayer.defaultProps = {
  type: adLayoutType.one,
}

export default AdsLayer
