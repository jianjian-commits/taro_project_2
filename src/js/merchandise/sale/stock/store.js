import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

class MerchandiseSaleStockStore {
  @observable stockDetailList = []
  @observable stockList = []
  @observable pinlei = []
  @observable category2 = []
  @observable category1 = []

  @action
  getStockDetail(data) {
    return Request('/product/stocks/flow')
      .data(data)
      .get()
      .then(
        action('getStockDetail', (json) => {
          this.stockDetailList = json.data
          return json
        })
      )
  }

  @action
  getStocks(req) {
    return Request('/product/stocks/list')
      .data(req)
      .get()
      .then(
        action('getStock', (json) => {
          this.stockList = json.data
          return json
        })
      )
  }

  @action
  editStock(req) {
    return Request('/product/stocks/edit').data(req).post()
  }

  @action
  getPinlei() {
    return Request('/merchandise/pinlei/get')
      .get()
      .then(
        action('getPinlei', (json) => {
          this.pinlei = json.data
        })
      )
  }

  @action
  getCategory2() {
    return Request('/merchandise/category2/get')
      .get()
      .then(
        action('getCategory2', (json) => {
          this.category2 = json.data
        })
      )
  }

  @action
  getCategory1() {
    return Request('/merchandise/category1/get')
      .get()
      .then(
        action('getCategory1', (json) => {
          this.category1 = json.data
        })
      )
  }
}

export default new MerchandiseSaleStockStore()
