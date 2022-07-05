import { action } from 'mobx'
import { BaseStore } from '../base_store'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchList(filter, '/stock/product/in_stock_sku')
  }

  @action export = (filter) => {
    return this.exportAsync(filter, '/stock/product/in_stock_sku')
  }
}

export const store = new Store()
