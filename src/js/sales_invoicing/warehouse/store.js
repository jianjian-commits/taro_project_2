import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import { formatLevelSelectData } from './util'

const initBatchFilter = {
  spu_id: '',
  q: '',
  type: '', // 类型 -1-全部 1-原料 2-成品
  shelfSelected: [],
}

class Store {
  @observable batchList = []

  @observable batchSelected = []

  @observable batchFilter = {
    ...initBatchFilter,
  }

  @observable shelfList = []

  @action
  clearSelected() {
    this.batchSelected = []
  }

  @action
  clearBatchFilter() {
    this.batchFilter = {
      ...initBatchFilter,
    }
  }

  @action
  changeBatchFilter(name, value) {
    this.batchFilter[name] = value
  }

  @action
  changeBatchSelected(selected) {
    this.batchSelected = selected
  }

  @action
  changeShelfSelected(selected) {
    this.batchFilter.shelfSelected = selected
  }

  @action
  setSpuId(spuId) {
    this.batchFilter.spu_id = spuId
  }

  getFilter() {
    const { spu_id, q, shelfSelected, type } = this.batchFilter

    return {
      spu_id,
      q,
      shelf_id: shelfSelected[shelfSelected.length - 1],
      remain_positive: 1,
      type: type || null,
    }
  }

  @action.bound
  fetchBatchList(pagination = {}) {
    const req = {
      ...this.getFilter(),
      ...pagination,
    }

    return Request('/stock/check/batch_number/list')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.batchList = json.data

          return json
        }),
      )
  }

  @action
  fetchShelfList() {
    return Request('/stock/shelf/tree')
      .get()
      .then(
        action((json) => {
          // 由于levelSelect数据结构与后台值不一致
          this.shelfList = formatLevelSelectData(json.data)

          return json
        }),
      )
  }
}

export default new Store()
