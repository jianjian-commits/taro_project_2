import { observable, runInAction, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'

const initPagination = {
  count: 0,
  limit: 10,
  offset: 0
}

const initFilter = {
  search_text: '',
  begin: new Date(),
  end: new Date()
}

class ListStore {
  constructor() {
    this.doFirstRequest = _.noop()
  }

  @observable list = []
  @observable sum = 0
  @observable filter = initFilter

  @action
  clearInfo() {
    this.list = []
    this.sum = 0
    this.filter = initFilter
  }

  @action
  setFilter(name, value) {
    this.filter[name] = value
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @action
  getList(page = initPagination) {
    const req = Object.assign({}, page, this.postFilter)

    return Request('/member/user/flow/list')
      .data(req)
      .get()
      .then(json => {
        runInAction(() => {
          this.list = json.data.user_flow_data
          this.sum = json.data.total_price
        })
        return json
      })
  }

  @computed
  get postFilter() {
    const { begin, end, search_text } = this.filter
    return {
      begin_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
      q: search_text
    }
  }
}

export default new ListStore()
