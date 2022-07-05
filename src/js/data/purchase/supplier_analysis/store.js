import { observable, action } from 'mobx'
import moment from 'moment'

class Store {
  @observable
  filter = {
    begin_time: moment(),
    end_time: moment(),
    type: '1',
    searchText: '',
  }

  @action
  setFilter = (filter) => {
    for (const key in filter) {
      this.filter[key] = filter[key]
    }
  }

  // 更新filter地址触发视图渲染
  @action
  onSearch = () => {
    this.filter = { ...this.filter }
  }
}

export default new Store()
