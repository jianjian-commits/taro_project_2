import { BaseStore } from '../base_store'
import { action } from 'mobx'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchList(filter, '/stock/abandon_goods/log/list')
  }
}

export const store = new Store()
