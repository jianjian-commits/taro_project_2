import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import { serviceTime } from '../filter'

class ServiceTimeItem extends React.Component {
  render() {
    const { data } = this.props
    const word = serviceTime.withData(data)

    return (
      <Flex
        row
        justifyCenter
        className='service-time-item gm-bg'
        onClick={this.props.onClick}
      >
        <Flex
          flex={1.5}
          alignCenter
          justifyCenter
          wrap
          className='gm-border-right'
        >
          <Flex>{data.name}</Flex>
        </Flex>
        <Flex column flex={1.5} className='gm-padding-lr-15'>
          <Flex className='gm-text-helper'>{i18next.t('下单时间')}</Flex>
          <Flex>{word.orderTimeLimit}</Flex>
        </Flex>
        <Flex column flex={1.5}>
          <Flex className='gm-text-helper'>{i18next.t('配送时间')}</Flex>
          <Flex>{word.receiveTimeLimit}</Flex>
        </Flex>
        <Flex column flex={1}>
          <Flex className='gm-text-helper'>{i18next.t('最晚出库时间')}</Flex>
          <Flex>{word.finalDistributeTime}</Flex>
        </Flex>
        {this.props.onClick ? (
          <Flex alignCenter>
            <span className='glyphicon glyphicon-chevron-right' />
          </Flex>
        ) : null}
      </Flex>
    )
  }
}

ServiceTimeItem.propTypes = {
  onClick: PropTypes.func,
}

export default ServiceTimeItem
