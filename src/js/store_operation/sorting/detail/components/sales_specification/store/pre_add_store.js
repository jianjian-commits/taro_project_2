import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  @observable outStockId = ''

  @observable outStockObject = ''

  @action
  changeValue(type, value) {
    this[type] = value
  }

  getReqData() {
    return { id: this.outStockId, out_stock_target: this.outStockObject }
  }

  @action
  postData() {
    const req = {
      ...this.getReqData(),
    }

    return Request('/stock/out_stock_sheet/create').data(req).post()
  }
}

export default new Store()
