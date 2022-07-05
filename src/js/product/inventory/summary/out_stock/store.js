import BaseStore from '../common/store'
import api from './api'
import _ from 'lodash'

class Store extends BaseStore {
  constructor() {
    super()
    this.initFilter()
    this.setApi(api)
  }

  initFilter(extend) {
    const extra = {
      ...extend,
      selectedCustomer: null,
    }
    super.initFilter(extra)
  }

  getQueryParams(isListSearch) {
    const { isSpuView, filter } = this
    // 按照分类查看
    if (!isSpuView) {
      // begin end q
      const params = this.getCategoryQueryParams(isListSearch)
      params.restaurant_id = _.get(filter, 'selectedCustomer.value')

      return params
    }

    const params = this.getSpuQueryParams(isListSearch)

    params.restaurant_id = _.get(filter, 'selectedCustomer.value')
    // 出库有商户
    return params
  }

  validateQueryParams(isListSearch) {
    return null
  }
}

export default new Store()
export { Store }
