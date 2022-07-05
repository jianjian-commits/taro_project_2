import { observable, action, computed } from 'mobx'
import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { isInvalidLocation } from 'common/util'

const initDetail = {
  name: '',
  principal: '',
  phone: '',
  district_code: '',
  area_l1: '',
  area_l2: '',
  address: '',
  business_status: 1,
  type: null,
  lat: null,
  lng: null,
}

class Store {
  @observable filter = {
    search_text: null,
    business_status: null,
    district_code: null,
    area_l1: null,
    area_l2: null,
    type: null,
  }

  @observable list = []

  @observable detail = { ...initDetail }

  @observable detailFd = null

  @observable loading = false

  @computed get centerPoint() {
    const { lat, lng } = this.detail
    return isInvalidLocation(lat, lng)
      ? {}
      : { center: { latitude: lat, longitude: lng } }
  }

  @action
  setFilter(obj) {
    this.filter = {
      ...this.filter,
      ...obj,
    }
  }

  @action
  getList(pagination = null) {
    this.loading = true
    return Request('/station/pick_up_station/list')
      .data({ ...this.filter, ...pagination })
      .get()
      .then(
        action((json) => {
          this.loading = false
          this.list = json.data
          return json
        })
      )
  }

  @action
  update(id) {
    if (!_.keys({ ...this.detailFd }).length) {
      Tip.info(i18next.t('没有修改详情'))
      return Promise.reject(new Error('没有修改详情'))
    }
    return Request('/station/pick_up_station/update')
      .data({ ...this.detailFd, id })
      .post()
  }

  @action
  create() {
    return Request('/station/pick_up_station/create')
      .data({ ...this.detail })
      .post()
  }

  @action
  delete(id) {
    return Request('/station/pick_up_station/delete').data({ id }).post()
  }

  @action
  clearDetail() {
    this.detail = { ...initDetail }
    this.detailFd = null
  }

  @action
  setDoFirstRequest(func) {
    this.doFirstRequest = func
  }

  @action
  getDetail(id) {
    this.loading = true
    return Request('/station/pick_up_station/get')
      .data({ id })
      .get()
      .then(
        action((json) => {
          this.loading = false
          this.detail = {
            ...json.data,
            area_l1: json.data.area_l1 + '',
            area_l2: json.data.area_l2 + '',
          }
        })
      )
  }

  @action
  updateDetail(obj) {
    this.detail = {
      ...this.detail,
      ...obj,
    }
  }

  @action
  updateDetailFd(obj) {
    this.detailFd = {
      ...this.detailFd,
      ...obj,
    }
  }
}

export default new Store()
