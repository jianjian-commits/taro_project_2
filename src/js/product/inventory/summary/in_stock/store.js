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
      selectedSupplier: {},
    }
    super.initFilter(extra)
  }

  getQueryParams(isListSearch) {
    const { isSpuView, filter } = this
    // 按照分类查看
    if (!isSpuView) {
      // begin end q
      const params = this.getCategoryQueryParams(isListSearch)
      params.supplier_id = _.get(filter.selectedSupplier, 'id')
      return params
    }

    const params = this.getSpuQueryParams(isListSearch)
    // 入库有供应商
    params.supplier_id = _.get(filter.selectedSupplier, 'id')
    return params
  }

  validateQueryParams(isListSearch) {
    return null
  }
}

export default new Store()
export { Store }
