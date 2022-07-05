import { BaseStore } from '../base_store'
import { action } from 'mobx'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchList(filter, '/stock/refund_stock_sku')
  }
}

export const store = new Store()
