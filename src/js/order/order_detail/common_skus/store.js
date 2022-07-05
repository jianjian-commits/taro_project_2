import { action, extendObservable } from 'mobx'
import _ from 'lodash'

import {
  debounce,
  dealCombineGoodsData,
  setSalePriceIfCombineGoods,
} from '../../util'
import orderStore from '../../store'

const initialState = {
  // 常用商品列表
  search_text: '',
  list: [],
}

class Store {
  constructor() {
    extendObservable(this, initialState)
  }

  reset() {
    this.search_text = ''
    this.list = []
  }

  @action.bound
  getCommonSkuList(search_text = '') {
    this.search_text = search_text
    debounce(() => {
      orderStore
        .getAddressSkus(search_text, 1)
        .then((data) => {
          let skus = []
          _.each(data, (sku) => {
            if (sku.is_combine_goods) {
              skus = skus.concat(dealCombineGoodsData(sku))
            } else {
              skus.push(sku)
            }
          })
          this.list = skus
        })
        .catch(() => {
          this.reset()
        })
    })
  }

  @action
  changeCommonSkuListSku(id, val) {
    const skus = this.list.slice()
    const target = _.find(skus, (v) => v.id === id)
    if (target) {
      target.quantity = val
      _.forEach(skus, (v) => {
        if (v.belongWith === id) v.quantity = val * target.skus_ratio[v.id]
      })
    }

    this.list = skus
  }

  addSkusToOrder(index, sku) {
    let skus = [sku]
    if (sku.is_combine_goods) {
      skus = dealCombineGoodsData(sku, sku.quantity)
      setSalePriceIfCombineGoods(skus)
    }
    orderStore.orderSkusChange(index, skus, 'common_list')
  }
}

export default new Store()
