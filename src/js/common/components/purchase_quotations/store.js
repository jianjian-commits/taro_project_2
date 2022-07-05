import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

const init = {
  station_day_avg_price: [],
  supplier_day_avg_price: [],
  latest_price: [],
  max_price: '0',
  min_price: '0',
  ring_ratio: '-',
  station_avg_price: '0',
  supplier_avg_price: '0',
}

class Store {
  @observable statistics = { ...init }
  @observable loading = true
  @observable filter = {
    type: 1,
  }

  @action
  clear() {
    this.statistics = { ...init }
  }

  @action
  setFilter(type) {
    this.filter.type = type
  }

  @action
  getStatistics(spec_id, supplier_id, type = 1) {
    this.loading = true
    Request('/purchase/purchase_spec/price_statistics')
      .data({
        spec_id,
        settle_supplier_id: supplier_id,
        query_type: type,
      })
      .get()
      .then((json) => {
        const data = json.data
        runInAction(() => {
          this.statistics = data
        })
        this.loading = false
      })
  }
}

export default new Store()
