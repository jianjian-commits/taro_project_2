import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

const init = {
  station_day_avg_price: [],
  max_price: '0',
  min_price: '0',
  ring_ratio: '-',
  station_avg_price: '0',
  latest_price: [],
}

class Store {
  @observable statistics = { ...init }

  @action
  getStatistics(spec_id, type = 1) {
    Request('/purchase/purchase_spec/price_statistics/no_supplier')
      .data({
        spec_id,
        query_type: type,
      })
      .get()
      .then(
        action((json) => {
          this.statistics = json.data
        })
      )
  }
}

export default new Store()
