import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'

class StockPreview {
  @observable list = []
  @observable stock_preview_info = {
    count_frozen: 0,
    name: '',
    std_unit_name: '',
  }

  @action
  fetchStockPreViewData(pagination = {}, spu_id) {
    const params = {
      spu_id,
      ...pagination,
    }

    return Request('/stock/list/frozen')
      .data(params)
      .get()
      .then(
        action((json) => {
          const { details, count_frozen, name, std_unit_name } = json.data
          this.list = details
          this.stock_preview_info = {
            count_frozen,
            name,
            std_unit_name,
          }
          return json
        }),
      )
  }

  @action
  setDoFirstRequest(func) {
    this.doFirstRequest = func
  }

  @action
  setPagination(pagination) {
    this.pagination = pagination
  }
}
export default new StockPreview()
