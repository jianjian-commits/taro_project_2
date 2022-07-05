import { BaseStore } from '../base_store'
import { action } from 'mobx'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchList(filter, '/stock/ingredient_recv/log')
  }

  @action export = (filter) => {
    return this.exportAsync(filter, '/stock/ingredient_recv/log')
  }
}

export const store = new Store()
