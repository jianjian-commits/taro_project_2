import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Flex, Dialog, Price, Button } from '@gmfe/react'
import { findDOMNode } from 'react-dom'
import { toJS } from 'mobx'
import Big from 'big.js'
import qs from 'query-string'
import notificationStore from './store'
import { parseRelativeTime } from './util'

@observer
class MessageList extends Component {
  constructor(props) {
    super(props)
    this.refMessageList = null
    this.handleDeleteAll = ::this.handleDeleteAll
  }

  handleSetReadOne(id, status) {
    if (status) return
    notificationStore.setReadOne(id)
  }

  handleDeleteAll() {
    Dialog.confirm({
      children: i18next.t('清空订单提醒消息?'),
      title: i18next.t('警告'),
    })
      .then(() => {
        const id = notificationStore.messageList[0].id
        notificationStore.deleteMessageAll(id)
      })
      .catch(() => {})
  }

  handleSetRead() {
    const id = notificationStore.messageList[0].id
    notificationStore.setReadAll(id)
  }

  handleScroll() {
    const messageList = findDOMNode(this.refMessageList)
    messageList.addEventListener(
      'scroll',
      _.throttle(() => {
        const offset = messageList.scrollTop + messageList.clientHeight
        if (
          messageList.scrollHeight - offset < 50 &&
          !notificationStore.noMore
        ) {
          notificationStore.getMessageList({
            offset: notificationStore.page * 20,
            limit: 20,
          })
        }
      }, 500),
    )
  }

  componentDidMount() {
    this.handleScroll()
  }

  renderMessageList(list) {
    if (list.length === 0) {
      return (
        <Flex className='gm-padding-top-10' justifyCenter>
          {i18next.t('没有消息数据')}
        </Flex>
      )
    }
    return _.map(list, (mes) => {
      const content = JSON.parse(mes.content)
      const isReadText =
        mes.status === 1 ? i18next.t('[已读]') : i18next.t('[未读]')
      const textColor = mes.status === 1 ? '#999' : '#333'
      const price = content.order_price
        ? Big(content.order_price).div(100).toFixed(2)
        : 0
      if (mes.type) {
        // i18n-scan-disable-next-line
        const messageText =
          content.order_type === '下单'
            ? `${isReadText}${content.customer_name} (${
                content.username
              }) ${i18next.t('下了一条新订单')} ${content.order_id},${i18next.t(
                '下单金额',
              )}${price}${Price.getUnit()}`
            : `${isReadText}${
                i18next.t('KEY266', {
                  VAR1: content.customer_name,
                  VAR2: content.username,
                  VAR3: content.order_id,
                }) /* tpl: ${VAR1}(${VAR2})在原订单 ${VAR3}上合并添加了新的商品 */
              }`

        // 判断订单类型, 零售订单跳转不一样
        let url = ''
        if (content.client && content.client === 10) {
          // 零售订单
          url = `#/c_retail/order/list/detail?${qs.stringify({
            id: content.order_id,
          })}`
        } else {
          url = `#/order_manage/order/list/detail?${qs.stringify({
            id: content.order_id,
          })}`
        }

        return (
          <div
            key={mes.id}
            className='gm-padding-tb-10 gm-padding-right-10 gm-border-bottom'
          >
            {
              <a
                href={url}
                onClick={this.handleSetReadOne.bind(this, mes.id, mes.status)}
                style={{
                  color: textColor,
                  textDecoration: 'none',
                }}
              >
                {messageText}
              </a>
            }
            {
              <p
                className='gm-padding-0 gm-margin-0 gm-text-12'
                style={{
                  textAlign: 'end',
                  color: textColor,
                  lineHeight: '12px',
                }}
              >
                {parseRelativeTime(mes.create_time)}
              </p>
            }
          </div>
        )
      } else {
        return null
      }
    })
  }

  render() {
    const messageList = toJS(notificationStore.messageList)
    return (
      <Flex column flex={1} style={{ height: '100%' }}>
        <Flex
          className='gm-padding-tb-15'
          style={{ borderBottom: '1px solid #eee' }}
        >
          <div className='gm-text-16 gm-padding-left-15'>
            <span
              className='gm-padding-left-5'
              style={{ borderLeft: '3px solid #56a3f2' }}
            >
              {i18next.t('订单提醒')}
            </span>
          </div>
          <Flex flex={1} justifyEnd>
            <Button type='primary' plain onClick={this.handleSetRead}>
              <i
                className='xfont xfont-ok gm-text-14'
                style={{ marginRight: '1px' }}
              />
              {i18next.t('全部已读')}
            </Button>
            <Button
              type='primary'
              plain
              onClick={this.handleDeleteAll}
              className='gm-margin-right-15 gm-margin-left-5'
            >
              <i
                className='xfont xfont-remove'
                style={{ marginRight: '1px' }}
              />
              {i18next.t('清空')}
            </Button>
          </Flex>
        </Flex>
        <Flex
          className='gm-border-top-0 gm-padding-left-15'
          column
          flex={1}
          style={{ overflow: 'auto' }}
          ref={(ref) => {
            this.refMessageList = ref
          }}
        >
          {this.renderMessageList(messageList)}
        </Flex>
      </Flex>
    )
  }
}

export default MessageList
