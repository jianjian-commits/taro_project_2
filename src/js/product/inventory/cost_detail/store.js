import moment from 'moment'
import { action, computed, observable } from 'mobx'
import { Request } from '@gm-common/request'

const date = moment().startOf('day')

const initFilter = {
  begin_time: date,
  end_time: date,
  q: '',
}

class CostDetail {
  @observable filter = { ...initFilter }
  @observable list = []

  @action
  initList() {
    this.filter = { ...initFilter }
    this.list = []
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  setFilterDate(begin, end) {
    this.filter.begin_time = begin
    this.filter.end_time = end
  }

  @computed
  get getFilterParam() {
    const { begin_time, end_time, q } = this.filter
    const params = {
      begin_time: moment(begin_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
    }

    if (q) {
      params.q = q
    }
    return params
  }

  @action
  fetchData(pagination = {}) {
    const params = {
      ...this.getFilterParam,
      ...pagination,
    }
    return Request('/stock/spu_adjust_logs/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.list = json.data
          return json
        })
      )
  }

  setPagination(pagination) {
    this.pagination = pagination
  }
}

export default new CostDetail()
