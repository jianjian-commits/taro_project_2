import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import { is } from '@gm-common/tool'

const goEasyConfig = {
  appkey: 'BS-df37e6e860c84f52a181180e6a2a9b28',
}

/**
 * 单例
 * 没监听channel就断掉连接，防止占用连接
 */
class Goeasy {
  constructor() {
    this.channels = new Set()
    this.disconnect = false
    this.init()
  }

  init() {
    this._goeasy = window.GoEasy
      ? new window.GoEasy({
          appkey: goEasyConfig.appkey,
          onConnectFailed: function (error) {
            console.log(error)
          },
        })
      : null
  }

  static getInstance() {
    if (!this._goeasy) {
      this._goeasy = new Goeasy()
    }

    if (this._goeasy.disconnect) {
      this._goeasy.reconnect()
    }
    return this._goeasy
  }

  subscribe(channel, onMessage, auth = true) {
    if (!this._goeasy || !auth || !channel || is.phone()) return
    if (!this.channels.has(channel)) {
      this.channels.add(channel)
    }
    this._goeasy.subscribe({
      channel,
      onMessage,
      onFailed: function (error) {
        Tip.warning(
          i18next.t('KEY264', {
            VAR1: error.code,
          }) /* src:`消息监听失败, 错误编码：${error.code}` => tpl:消息监听失败, 错误编码：${VAR1} */,
        )
      },
      onSuccess: function () {
        console.log(`${channel}订阅成功`)
      },
    })
  }

  unsubscribe(channel) {
    if (!this._goeasy) return
    this._goeasy.unsubscribe({
      channel,
    })
    this.channels.delete(channel)
    if (this.channels.size === 0) {
      this._goeasy.disconnect()
      this.disconnect = true
    }
  }

  reconnect() {
    if (!this._goeasy) return
    this._goeasy.reconnect()
    this.disconnect = false
  }
}

export default Goeasy
