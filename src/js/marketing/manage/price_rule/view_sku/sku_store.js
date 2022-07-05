import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

class RuleStore {
  @observable
  list = []

  @observable
  pagination = {
    count: 0,
    offset: 0,
    limit: 10,
  }

  @observable
  filter = {
    type: 'customer',
    status: 3,
    addressText: '',
    skuText: '',
    stationId: null,
  }

  @observable
  loading = false

  @action
  init() {
    this.filter = {
      status: 3,
      searchText: '',
      stationId: null,
    }
    this.list = []
    this.pagination = {
      count: 0,
      offset: 0,
      limit: 10,
    }
    this.loading = false
  }

  @action
  fetchData(pagination, ruleTarget, status, keyword1, keyword2, station_id) {
    this.loading = true
    return Request('/station/price_rule/sku_search', { timeout: 15000 })
      .data({
        address_text: keyword1,
        sku_text: keyword2,
        station_id: station_id || '',
        status: status === '-1' ? '' : status,
        cur_page: pagination.offset / pagination.limit || 0,
        cnt_per_page: pagination.limit || 10,
        type: ruleTarget,
      })
      .get()
      .then(
        action((json) => {
          this.loading = false
          this.list = json.data.list
          this.pagination = json.data.pagination
        })
      )
      .catch(
        action(() => {
          this.loading = false
        })
      )
  }

  @action
  handleFilterChange(name, value) {
    this.filter[name] = value
  }

  @action
  updateRulePrice(price_rule_id, address_id, sku_id, rule_type, yx_price) {
    return Request('/station/price_rule/address/edit')
      .data({
        price_rule_id,
        address_id,
        sku_id,
        yx_price,
        rule_type,
      })
      .post()
  }
}

export default new RuleStore()
