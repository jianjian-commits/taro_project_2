import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { Drawer, Tip, Price } from '@gmfe/react'
import { observer } from 'mobx-react'
import MessageList from './message_list'
import notificationStore from './store'
import Goeasy from './goeasy'
import naudio from './audio'
import Big from 'big.js'
import globalStore from '../stores/global'
import autoPrint from '../printer/order_printer/print/auto_print'
import bridge from '../bridge'

const Storage = window.localStorage
const ROOT_KEY = 'NOTIFICATION_ROOT_KEY_V1.1'
let intervalTimer = null

@observer
class Notification extends Component {
  constructor(props) {
    super(props)
    // todo 先重置下，有客户不知道什么原因，没有执行重置导致不会唤起连接
    this.reset()
  }

  reset() {
    Storage.setItem(ROOT_KEY, 0)
    notificationStore.setRoot(0)
  }

  handleNotificationClick() {
    notificationStore.reset()
    notificationStore.getMessageList()
    Drawer.render({
      children: <MessageList />,
      onHide: Drawer.hide,
      opacityMask: true,
      style: {
        width: '300px',
        heighe: '100%',
      },
    })
  }

  handleAutoPrint = (m) => {
    const { order_ids } = JSON.parse(m.content)
    autoPrint({ ids: order_ids })
  }

  handleNotificationMessage = (m) => {
    const message = JSON.parse(m.content)
    const price = message.order_price
      ? Big(message.order_price).div(100).toFixed(2)
      : 0
    // i18n-scan-disable-next-line
    const messageText =
      message.order_type === '下单'
        ? `${message.customer_name} (${message.username}) ${i18next.t(
            '下了一条新订单',
          )} ${message.order_id},${i18next.t(
            '下单金额',
          )}${price}${Price.getUnit()}`
        : `${
            i18next.t('KEY266', {
              VAR1: message.customer_name,
              VAR2: message.username,
              VAR3: message.order_id,
            }) /* tpl: ${VAR1}(${VAR2})在原订单 ${VAR3}上合并添加了新的商品 */
          } `

    notificationStore.getUnReadCount()

    naudio.play()
    window.Notification.requestPermission((status) => {
      if (status === 'granted') {
        // eslint-disable-next-line no-new
        new window.Notification(i18next.t('订单通知'), {
          // eslint-disable-line
          body: messageText,
          icon: globalStore.logo.logoPure || globalStore.logo.logo,
        })
      } else {
        Tip.info({
          children: messageText,
          time: 4000,
        })
      }
    })
  }

  handleSubscribe = () => {
    const auth = globalStore.hasPermission('receive_order_remind')
    const goeasy = Goeasy.getInstance()
    if (notificationStore.isRoot) {
      goeasy.subscribe(
        globalStore.user.station_id,
        this.handleNotificationMessage,
        auth,
      )
    }

    goeasy.subscribe(
      // 'T10001_print',
      `${globalStore.user.station_id}_print`,
      this.handleAutoPrint,
      bridge.isElectron,
    )
  }

  handleRemoveTimer = () => {
    if (intervalTimer) {
      clearInterval(intervalTimer)
      intervalTimer = null
    }
  }

  // 主tab 标示
  handleSetRoot = () => {
    const auth = globalStore.hasPermission('receive_order_remind')
    const hasRoot = JSON.parse(Storage.getItem(ROOT_KEY)) || 0
    if (!hasRoot && auth) {
      Storage.setItem(ROOT_KEY, 1)
      notificationStore.setRoot()
    }
  }

  handleUnsubscribe = () => {
    if (notificationStore.isRoot) {
      const goeasy = Goeasy.getInstance()
      goeasy.unsubscribe(globalStore.user.station_id)
      notificationStore.setRoot(0)
    }
  }

  handleStorageListener = () => {
    window.addEventListener('storage', (e) => {
      if (e.key === ROOT_KEY) {
        const time = 3000
        this.handleRemoveTimer()
        intervalTimer = setTimeout(() => {
          // 延迟
          const currentValue = JSON.parse(Storage.getItem(ROOT_KEY))
          if (currentValue) {
            this.handleUnsubscribe() // 清除多余连接
          } else {
            this.handleSetRoot()
            this.handleSubscribe()
          }
          this.handleRemoveTimer()
        }, time)
      }
    })
  }

  handleBeforeUploadListener = () => {
    window.addEventListener('beforeunload', () => {
      notificationStore.isRoot && this.reset()
    })
  }

  async componentDidMount() {
    await notificationStore.getUnReadCount()
    this.handleSetRoot()
    this.handleSubscribe() // 订阅chanel
    this.handleStorageListener()
    this.handleBeforeUploadListener()
  }

  render() {
    const { unReadCount } = notificationStore
    return (
      <div
        className='gm-position-relative'
        onClick={this.handleNotificationClick}
      >
        {!!unReadCount && (
          <div
            className='gm-position-absolute'
            style={{
              top: '-2px',
              left: '15px',
              padding: '0 4px',
              lineHeight: '12px',
              borderRadius: '8px',
              background: 'red',
              minWidth: '8px',
              color: 'white',
            }}
          >
            {unReadCount > 99 ? '99+' : unReadCount}
          </div>
        )}
        {this.props.children}
      </div>
    )
  }
}

export default Notification
