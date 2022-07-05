import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'

class Store {
  @observable
  filter = {
    start_time: moment().subtract(7, 'day').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
    q_type: 0,
  }

  // eslint-disable-next-line gmfe/no-observable-empty-object
  @observable
  pagination = {}

  @observable
  list = []

  @action
  fetchData() {
    return Request('/home_page/new_info/list')
      .data({
        ...this.filter,
        ...this.pagination,
      })
      .get()
      .then(
        action((json) => {
          this.list = json.data
          return json
        }),
      )
  }

  @action
  handleFilterChange(type, value) {
    this.filter[type] = value
  }

  @action
  handleDateChange = (begin, end) => {
    this.filter.start_time = moment(begin).format('YYYY-MM-DD')
    this.filter.end_time = moment(end).format('YYYY-MM-DD')
  }

  @action
  handlePageChange = (pagination) => {
    this.pagination = pagination
    return this.fetchData()
  }
}

export default new Store()
