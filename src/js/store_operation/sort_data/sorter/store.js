import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}
const initData = {
  pagination: { count: 0 },
  sorters: [],
}
class Store {
  @observable filterRules = {
    task_scope: undefined,
  }

  @observable data = {
    ...initData,
  }

  @observable pagination = { ...initPagination }

  @action
  getSorterList(pagination = {}) {
    return Request(`/sorter/search`)
      .data({ ...this.filterRules, ...pagination })
      .get()
      .then((json) => {
        const { data } = json
        this.data = data
        this.pagination = json.pagination
        return data
      })
  }

  @action
  filterChange(obj) {
    this.filterRules = {
      ...this.filterRules,
      ...obj,
    }
  }

  @action
  clearStore() {
    this.filterRules = {
      task_scope: undefined,
    }
    this.data = {
      ...initData,
    }
    this.pagination = {
      ...initPagination,
    }
  }
}

export default new Store()
