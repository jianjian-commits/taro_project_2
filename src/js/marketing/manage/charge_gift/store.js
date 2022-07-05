import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

class ListStore {
  constructor() {
    this.doFirstRequest = _.noop()
  }

  @observable filter = {
    status: 10,
    name: '',
  }

  @observable list = []

  @action
  changeFilter(name, val) {
    this.filter[name] = val
  }

  @action
  changeChargeGiftList(name, index, val) {
    const new_list = this.list.slice()
    new_list[index][name] = val
    this.list = new_list
  }

  @action
  updateChargeGiftDetail(data = {}) {
    // todo将详情与列表状态合并
    const req = data
    return Request('/station/charge_gift/update').data(req).post()
  }

  // 获取充值赠送的列表
  @action.bound
  getChargeGiftList(pagination = {}) {
    const { status, name } = this.filter
    let req = {
      ...pagination,
      name: name !== '' ? name : null,
    }
    if (status !== 10) {
      req = Object.assign({}, req, { status })
    }

    return Request('/station/charge_gift/list')
      .data(req)
      .get()
      .then(
        action('getChargeGiftList', (json) => {
          this.list = json.data
          this.pagination = json.pagination
          return json
        })
      )
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }
}

export default new ListStore()
