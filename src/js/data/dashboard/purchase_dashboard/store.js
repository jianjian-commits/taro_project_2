import { observable, action } from 'mobx'
import moment from 'moment'

const initTimeQuantum = {
  begin_time: moment().subtract(7, 'days'),
  end_time: moment(),
}

class Store {
  @observable filter = initTimeQuantum // 时间段

  @action
  setFilter(filter) {
    this.filter = { ...this.filter, ...filter }
  }
}

export default new Store()
