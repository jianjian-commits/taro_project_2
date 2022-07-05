import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import _ from 'lodash'

class NotificationStore {
  // 通知
  @observable unReadCount = 0
  @observable messageList = []
  @observable page = 0
  @observable isRoot = 0
  @observable noMore = false

  @action.bound
  getMessageList(param = {}) {
    Request('/message/list')
      .data(param)
      .get()
      .then((json) => {
        if (json.data.messages.length < 20) {
          this.noMore = true
        }
        this.messageList = this.messageList.concat(json.data.messages)
        this.unReadCount = json.data.unread_count
        this.page = this.page + 1
      })
  }

  @action.bound
  getUnReadCount() {
    return Request('/message/unread/count')
      .get()
      .then((json) => {
        this.unReadCount = json.data.unread_count
        return json
      })
  }

  @action
  setRoot(isRoot = 1) {
    this.isRoot = isRoot
  }

  @action
  reset() {
    this.messageList = []
    this.page = 0
    this.noMore = false
  }

  @action
  syncUnreadCount(num) {
    this.unReadCount = num
  }

  @action.bound
  setReadOne(id) {
    Request('/message/set_read/one')
      .data({ id })
      .post()
      .then((json) => {
        if (!json.code) {
          this.messageList = _.map(this.messageList, (mes) => {
            if (mes.id === id) {
              return Object.assign(mes, { status: 1 })
            } else {
              return mes
            }
          })
          this.unReadCount = this.unReadCount - 1
        }
      })
  }

  @action.bound
  setReadAll(last_message_id) {
    Request('/message/set_read/all')
      .data({ last_message_id })
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('消息全部置为已读'))
          this.messageList = _.map(this.messageList, (mes) => {
            return Object.assign(mes, { status: 1 })
          })
          this.unReadCount = 0
        }
      })
  }

  @action.bound
  deleteMessageAll(last_message_id) {
    Request('/message/delete/all')
      .data({ last_message_id })
      .post()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('消息已全部清空'))
          this.messageList = []
          this.unReadCount = 0
        }
      })
  }
}

export default new NotificationStore()
