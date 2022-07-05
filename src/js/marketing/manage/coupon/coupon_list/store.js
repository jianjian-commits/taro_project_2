import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import { System } from 'common/service'

const initFilter = {
  is_active: 1,
  q: '',
  sort_type: null,
  sort_direction: null,
  audience_type: -1, // 可见范围
}
class ListStore {
  @observable filter = initFilter

  @observable list = []

  @observable pagination = ''

  @action
  changeFilter(name, val) {
    this.filter[name] = val
  }

  @action.bound
  getCouponList(pagination = {}) {
    const {
      is_active,
      q,
      sort_direction,
      sort_type,
      audience_type,
    } = this.filter
    let req = { q, count: 1, ...pagination }
    if (is_active !== 10) req = Object.assign({}, req, { is_active })
    if (audience_type === -1) {
      req.search_type = System.isC() ? 2 : 1
    } else {
      req.audience_type = audience_type
    }
    if (sort_type && sort_direction) {
      req = Object.assign({}, req, {
        sort_type: sort_type === 'give_out_num' ? 2 : 1,
        reverse: sort_direction === 'desc' ? 0 : 1,
      })
    }
    if (System.isC()) req.is_retail_interface = 1

    return Request('/coupon/list')
      .data(req)
      .get()
      .then(
        action('getCouponList', (json) => {
          this.list = json.data
          this.pagination = json.pagination
          return json
        })
      )
  }

  @action
  couponListSort(name, direction) {
    return Promise.resolve(
      (this.filter = Object.assign({}, this.filter, {
        sort_type: name,
        sort_direction: direction,
      }))
    )
  }

  @action
  init() {
    this.filter = initFilter
    this.list = []
    this.pagination = ''
  }
}

export default new ListStore()
