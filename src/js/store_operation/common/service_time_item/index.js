import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Flex } from '@gmfe/react'
const propTypes = {
  itemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  itemName: PropTypes.string,
  orderTime: PropTypes.string,
  deliveryTime: PropTypes.string,
  distributionTime: PropTypes.string,
  next: PropTypes.bool,
  handleSelect: PropTypes.func,
  bottomBorder: PropTypes.bool,
}

const defaultProps = {
  itemId: 0,
  itemName: i18next.t('加载中...'),
  orderTime: i18next.t('加载中...'),
  deliveryTime: i18next.t('加载中...'),
  distributionTime: i18next.t('加载中...'),
  next: true,
  handleSelect: () => {
    console.info('no pass handleSelect function')
  },
  bottomBorder: true,
}

class ServiceTimeItem extends Component {
  constructor(props) {
    super(props)
    this.handleClick = ::this.handleClick
  }

  handleClick() {
    const { itemId, handleSelect } = this.props
    handleSelect(itemId)
  }

  render() {
    const {
      itemName,
      orderTime,
      deliveryTime,
      distributionTime,
      next,
      bottomBorder,
    } = this.props

    const itemClass = classNames('service-time-item', 'gm-bg', {
      'service-time-no-next': !next,
      'service-time-no-bottom-border': !bottomBorder,
    })

    return (
      <Flex row justifyCenter className={itemClass} onClick={this.handleClick}>
        <Flex
          flex={1.5}
          alignCenter
          justifyCenter
          wrap
          className='gm-border-right'
        >
          <Flex>{itemName}</Flex>
        </Flex>
        <Flex column flex={1.5} className='gm-padding-lr-15' justifyCenter>
          <Flex className='gm-text-helper'>{i18next.t('下单时间')}</Flex>
          <Flex>{orderTime}</Flex>
        </Flex>
        <Flex column flex={1.5} justifyCenter>
          <Flex className='gm-text-helper'>{i18next.t('配送时间')}</Flex>
          <Flex>{deliveryTime}</Flex>
        </Flex>
        {distributionTime ? (
          <Flex column flex={1} justifyCenter>
            <Flex className='gm-text-helper'>{i18next.t('最晚出库时间')}</Flex>
            <Flex>{distributionTime}</Flex>
          </Flex>
        ) : null}
        {next ? (
          <Flex alignCenter>
            <span className='glyphicon glyphicon-chevron-right' />
          </Flex>
        ) : null}
      </Flex>
    )
  }
}

ServiceTimeItem.propTypes = propTypes
ServiceTimeItem.defaultProps = defaultProps

export default ServiceTimeItem
