import { action, observable } from 'mobx'
import { Storage } from '@gmfe/react'
import _ from 'lodash'
import { getStaticStorage } from 'gm_static_storage'

const KEY = 'UN_REMINDER'
class Store {
  @observable
  unReminder = Storage.get(KEY) || []

  @observable
  config = {}

  @observable
  init = false

  @action
  hide(pathname) {
    this.unReminder = _.uniq(this.unReminder.concat(pathname))

    Storage.set(KEY, this.unReminder.slice())
  }

  @action
  fetchData() {
    getStaticStorage('/station/page_tip.json').then(
      action((config) => {
        this.init = true
        this.config = config
      })
    )
  }
}

export default new Store()
