import { BaseStore } from '../base_store'
import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'

class Store extends BaseStore {
  @observable filter = {
    time_type: 2,
    find_type: 1,
    begin: new Date(),
    end: new Date(),
    time_config_id: null,
    text: '',
    category_id_1: '',
    category_id_2: '',
  }

  /**
   * 临时存储
   * @type {Object}
   */
  temporaryFilter = {}

  @action mergeFilter = (filter) => {
    this.filter = filter
  }

  @action fetchData = (filter) => {
    return this.fetchListApart(
      filter,
      '/stock/out_stock_sku',
      '/stock/out_stock_sku/count',
    )
  }

  @action updateOutboundPrice = (data) => {
    return Request('/stock/out_stock_price/update')
      .data({ goods_infos: JSON.stringify(data) })
      .post()
  }

  @action export = (filter) => {
    return this.exportAsync(filter, '/stock/out_stock_sku')
  }
}

export const store = new Store()
