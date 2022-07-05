import { action, observable } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { skuListAdapter } from '../../../../../common/util'

class Store {
  @observable selectedCustomers = []

  @observable customersGroupByRoute = [] // 路线筛选

  @observable skuList = []

  @observable selectedSkus = []

  @observable skuListLoading = true

  @observable step = 0

  @action
  clear() {
    this.selectedCustomers = []
    this.selectedSkus = []
    this.step = 0
  }

  @action
  setSelectedCustomers(selected) {
    this.selectedCustomers = selected
  }

  @action
  setStep(step) {
    this.step = step
  }

  @action
  getCustomers(salemenu_id) {
    return Request('/supplier/priority_supplier/address/list')
      .data({ salemenu_id })
      .get()
      .then(
        action((json) => {
          const arr = []
          _.each(_.groupBy(json.data, 'route_id'), (list) => {
            const item = {
              value: list[0].route_id || -1,
              name: list[0].route_name || i18next.t('无线路'),
              children: [],
            }
            _.each(list, (v) => {
              item.children.push({
                value: v.address_id,
                name: v.address_name,
              })
            })
            arr.push(item)
          })
          this.customersGroupByRoute = arr
          return json
        })
      )
  }

  @action
  getSkuList(salemenu_id) {
    this.skuListLoading = true
    return Request('/supplier/priority_supplier/sku_tree')
      .data({ salemenu_ids: JSON.stringify([salemenu_id]) })
      .get()
      .then(
        action((json) => {
          const list = json.data
          this.skuListLoading = false
          this.skuList = skuListAdapter(list)
        })
      )
  }

  @action
  setSelectedSkus(selected) {
    this.selectedSkus = selected
  }
}

export default new Store()
