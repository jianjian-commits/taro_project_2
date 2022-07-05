import { action } from 'mobx'
import { BaseStore } from '../base_store'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchList(filter, '/stock/return_supply_sku')
  }
}

export const store = new Store()
