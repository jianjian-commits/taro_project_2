import { observable, action } from 'mobx'

import { createShare } from './service'

class Store {
  @observable shareDatas = {
    token: '',
    station_id: '',
  }

  @action
  createShare(params) {
    createShare(params).then((res) => {
      if (res?.code === 0) {
        const {
          data: { token, station_id },
        } = res
        this.shareDatas = { token, station_id }
      }
    })
  }
}

export default new Store()
