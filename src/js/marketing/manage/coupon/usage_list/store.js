import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { System } from 'common/service'

const initFilter = {
  collect_begin_time: moment().startOf('day'),
  collect_end_time: moment().startOf('day'),
  q: '',
  status: 10,
}
class ListStore {
  @observable filter = initFilter

  @observable list = []

  @action
  changeFilter(name, val) {
    this.filter[name] = val
  }

  @action
  changeDate(begin, end) {
    this.filter = Object.assign({}, this.filter, {
      collect_end_time: end,
      collect_begin_time: begin,
    })
  }

  @action
  getFilter() {
    const { collect_begin_time, collect_end_time, q, status } = this.filter
    let req = {
      q,
      collect_begin_time: moment(collect_begin_time).format('YYYY-MM-DD'),
      collect_end_time: moment(collect_end_time).format('YYYY-MM-DD'),
    }
    if (status !== 10) req = Object.assign({}, req, { status })
    req.search_type = System.isC() ? 2 : 1

    return req
  }

  @action.bound
  getUsageList(pagination = {}) {
    const req = {
      ...this.getFilter(),
      ...pagination,
    }
    if (System.isC()) req.is_retail_interface = 1

    return Request('/coupon/usage/list')
      .data(req)
      .get()
      .then(
        action('getUsageList', (json) => {
          this.list = json.data
          return json
        })
      )
  }

  @action
  export() {
    const req = {
      ...this.getFilter(),
      async: 1,
    }
    if (System.isC()) req.is_retail_interface = 1

    return Request('/coupon/usage/export').data(req).get()
  }

  @action
  init() {
    this.filter = initFilter
    this.list = []
  }
}

export default new ListStore()
