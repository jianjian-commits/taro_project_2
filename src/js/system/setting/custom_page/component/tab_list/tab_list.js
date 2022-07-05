import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex } from '@gmfe/react'
import _ from 'lodash'
import { tabSize } from '../enum'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { isCStationAndC } from 'common/service'

const getSize = (size, bool) => {
  let width = 24
  let borderRadius = 8
  if (size === tabSize.small) {
    width = 20
    bool && (width = 40)
    borderRadius = 6
  } else if (size === tabSize.middle) {
    width = 24
    bool && (width = 45)
    borderRadius = 8
  } else if (size === tabSize.big) {
    width = 28
    bool && (width = 50)
    borderRadius = 10
  }
  if (bool) {
    borderRadius = 0
  }
  return {
    width: width,
    height: width,
    borderRadius: borderRadius,
  }
}

@observer
class TabList extends React.Component {
  render() {
    const { size, labels, style } = this.props
    const labelArr = (labels && labels.slice(0, 10)) || _.range(10)
    const hasMore = labels && labels.length > 10

    // toc去掉 我的收藏与组合商品 展示
    let label_arr = labelArr
    if (isCStationAndC()) {
      label_arr = _.filter(
        labelArr,
        (label) => label.id !== 'FAV' && label.id !== 'COMBINE'
      )
    }

    return (
      <Flex style={style} wrap alignStart className='b-home-category-card'>
        {_.map(label_arr, (label, i) => {
          return (
            <Flex
              key={i}
              justifyCenter
              alignCenter
              column
              width='20%'
              className='b-home-category-item'
            >
              <Flex
                className='b-home-iconbox'
                style={{
                  ...{
                    backgroundImage: labels && `url(${label.url})`,
                    backgroundColor: labels && 'white',
                    padding: labels && '8px 0',
                  },
                  ...getSize(size, !!labels),
                }}
              />
              <Flex className='b-home-icontext'>
                {labels ? label.name : i18next.t('名称')}
              </Flex>
            </Flex>
          )
        })}
        <Flex justifyCenter style={{ width: '100%', height: 4, marginTop: 8 }}>
          {hasMore ? <span className='b-home-category-more' /> : ''}
        </Flex>
      </Flex>
    )
  }
}

TabList.propTypes = {
  display: PropTypes.bool,
  size: PropTypes.oneOf([tabSize.small, tabSize.middle, tabSize.big]),
  labels: PropTypes.array,
  style: PropTypes.object,
}

TabList.defaultProps = {
  display: false,
  size: tabSize.small,
}

export default TabList
