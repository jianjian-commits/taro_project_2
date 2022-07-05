import { BaseStore } from '../base_store'
import { action } from 'mobx'

export default new (class Store extends BaseStore {
  @action fetchData = (params) => {
    return this.fetchList(
      Object.assign({}, this.handleFilterParams(), params),
      '/stock/split/out_stock/list',
    )
  }

  handleFilterParams = () => {
    const {
      text,
      category_id_1,
      category_id_2,
      begin,
      end,
      time_type,
      find_type,
    } = this.filter
    const result = {
      begin,
      end,
      time_type,
    }
    if (find_type) {
      result.find_type = find_type
    }
    if (text) {
      result.q = text
    }
    if (category_id_1) {
      result.category1_ids = category_id_1
    }
    if (category_id_2) {
      result.category2_ids = category_id_2
    }
    return result
  }
})()
