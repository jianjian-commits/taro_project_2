import { observable, runInAction, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const initPagination = {
  count: 1,
  offset: 0,
  limit: 10
}

const initFilter = {
  telphone: '',
  member_status: 0
}

class ListStore {
  constructor() {
    this.doInfoFirstRequest = _.noop()
    this.doBuyFirstRequest = _.noop()
  }

  @observable filter = initFilter
  @observable count = 0
  @observable list = []
  @observable buy_list = []

  @action
  setFilter(name, value) {
    this.filter[name] = value
  }

  @action
  clearInfo() {
    this.filter = initFilter
    this.count = 0
    this.list = []
  }

  @action
  clearBuyList() {
    this.buy_list = []
  }

  @action
  setDoInfoFirstRequest(func) {
    // doInfoFirstRequest有ManagePaginationV2提供
    this.doInfoFirstRequest = func
  }

  @action
  setDoBuyFirstRequest(func) {
    // doBuyFirstRequest有ManagePaginationV2提供
    this.doBuyFirstRequest = func
  }

  @action
  getBuyList(id, page = initPagination) {
    const req = Object.assign({}, page, { id })
    return Request('/member/user/flow/detail')
      .data(req)
      .get()
      .then(json => {
        runInAction(() => {
          this.buy_list = json.data
        })
        return json
      })
  }

  @action
  getList(page = initPagination) {
    const status = this.filter.member_status
    const req = Object.assign({}, page, {
      q: this.filter.telphone,
      status: status === 0 ? null : status,
      count: 1
    })

    return Request('/member/list')
      .data(req)
      .get()
      .then(json => {
        runInAction(() => {
          this.list = json.data
          this.count = json.pagination.count
        })
        return json
      })
  }
}

export default new ListStore()
