import { action } from 'mobx'
import { BaseStore } from '../base_store'

class Store extends BaseStore {
  @action fetchData = (filter) => {
    return this.fetchListApart(
      filter,
      '/stock/in_stock_sku',
      '/stock/in_stock_sku/count',
    )
  }

  @action export = (filter) => {
    return this.exportAsync(filter, '/stock/in_stock_sku')
  }
}

export const store = new Store()
