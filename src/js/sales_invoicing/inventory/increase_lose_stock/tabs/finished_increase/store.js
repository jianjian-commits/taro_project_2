import { BaseStore } from '../../base_store'
import { action } from 'mobx'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchList(filter, '/stock/product/increase')
  }

  @action export = (filter) => {
    return this.exportAsync(filter, '/stock/product/increase')
  }
}

export const store = new Store()
