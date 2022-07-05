import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'

class Store {
  @observable platforms = []
  @observable loading = true
  @observable failList = {
    list: [],
    start_date: new Date(),
    end_date: new Date(),
  }

  @observable
  youzanInfo = {
    shop_name: '',
    auth_status: '',
  }

  youzanId = '66e11aa69682202947c38dc5e144c8597a98edbd'
  yongyouId = '2c1690a0557f5ea63449f47d9a564771e6a7e90d'
  pospalId = '1d9c90bbc00f3118f5d02c48e52a8411a4c4a766'

  getPlatform(index) {
    const platforms = this.platforms.slice()
    return platforms[index]
  }

  @action
  youzanCheck() {
    return Request('/youzan/auth/check')
      .get()
      .then(
        action((json) => {
          this.youzanInfo = json.data
          return json
        }),
      )
  }

  @action
  clear() {
    this.platforms = []
    this.loading = true
  }

  @action
  getPlatforms() {
    this.loading = true
    return Request('/openapi/app/list')
      .get()
      .then(
        action((json) => {
          this.platforms = json.data
          this.loading = false
        }),
      )
  }

  @action
  updateApp(index, settings, sync) {
    const platform = this.getPlatform(index)
    return Request('/openapi/app/update')
      .data({
        appid: platform.appid,
        settings: JSON.stringify(settings),
        sync,
      })
      .post()
  }

  @action
  getAuthority(index) {
    const platform = this.getPlatform(index)
    return Request('/openapi/app/auth').data({ appid: platform.appid }).post()
  }

  @action
  cancelAuthority(index) {
    const platform = this.getPlatform(index)
    return Request('/openapi/app/cancel_auth')
      .data({ appid: platform.appid })
      .post()
  }

  @action
  getErrorList(params) {
    const { start_date, end_date } = this.failList
    const data = Object.assign({}, params, {
      start_date: moment(start_date).format('YYYY-MM-DD'),
      end_date: moment(end_date).format('YYYY-MM-DD'),
    })
    return Request('/openapi/app/msg/fail/list')
      .data(data)
      .get()
      .then(
        action((json) => {
          this.failList.list = json.data
          return json
        }),
      )
  }

  @action
  updateErrorListFilter({ start_date, end_date }) {
    this.failList.start_date = start_date
    this.failList.end_date = end_date
  }

  @action
  syncPospal(file) {
    return Request('/openapi/app/pospal/sync_sku').data({ file }).post()
  }

  @action
  sync(index) {
    const platform = this.getPlatform(index)
    const { appid } = platform
    const url =
      appid !== this.yongyouId
        ? '/openapi/app/sync_spu'
        : '/openapi/app/sync_sku'
    return Request(url).data({ appid }).post()
  }
}

export default new Store()
