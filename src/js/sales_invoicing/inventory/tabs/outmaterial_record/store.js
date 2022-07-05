import { action } from 'mobx'
import { BaseStore } from '../base_store'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchList(filter, '/stock/ingredient_return/log')
  }

  @action export = (filter) => {
    return this.exportAsync(filter, '/stock/ingredient_return/log')
  }
}

export const store = new Store()
