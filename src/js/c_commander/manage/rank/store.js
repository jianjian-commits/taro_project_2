import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'

class Store {
  @observable filter = {
    dateType: '1',
    begin: new Date(),
    end: new Date(),
    search_text: ''
  }

  // 排序
  @observable sortItem = {
    sort_by: '',
    sort_direction: ''
  }

  @observable updateList = []

  @observable loading = false

  @action
  setValue(key, value) {
    this.filter[key] = value
  }

  @action
  setDateFilterChange(filter) {
    const filterObj = { ...this.filter, ...filter }
    this.filter = filterObj
  }

  @action
  getParams() {
    const { begin, end, dateType, search_text } = this.filter
    let date = {}

    if (+dateType === 1) {
      date = {
        order_time_begin: moment(begin).format('YYYY-MM-DD'),
        order_time_end: moment(end).format('YYYY-MM-DD')
      }
    } else if (+dateType === 3) {
      date = {
        receive_begin_time: moment(begin).format('YYYY-MM-DD'),
        receive_end_time: moment(end).format('YYYY-MM-DD')
      }
    }

    return {
      search_text,
      ...date
    }
  }

  @action
  fetchList(pagination = null) {
    const params = { ...this.getParams(), ...pagination }

    this.loading = true
    return Request('/community/distributor/performance/list')
      .data(params)
      .get()
      .then(
        action(json => {
          this.updateList = json.data.distributor_performance || []
          this.loading = false
          this.sortItem = { sort_by: '', sort_direction: '' }
        })
      )
  }

  @action
  handleExport() {
    return Request('/community/distributor/performance/export')
      .data({
        ...this.getParams()
      })
      .get()
  }

  @action
  setSortItem(obj) {
    this.sortItem = { ...obj }
  }
}

export default new Store()
