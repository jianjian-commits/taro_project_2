import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { convertNumber2Sid } from 'common/filter'
import { resNameSortByFirstWord } from 'common/util'

class Store {
  @observable
  list = [this.initItem()]

  @observable
  customerList = []

  initItem() {
    return {
      name: '',
      customer: null,
      url: '',
      app_id: '',
      app_key: '',
      supplier_id: '',
    }
  }

  @action
  reset() {
    this.list = [this.initItem()]
  }

  @action
  addItem(index) {
    const list = this.list.slice()
    const item = this.initItem()
    if (index === undefined) {
      list.push(item)
    } else {
      list.splice(index, 0, item)
    }
    this.list = list
  }

  @action
  deleteItem(index) {
    if (index === undefined) return
    const list = this.list.slice()
    list.splice(index, 1)
    this.list = list
  }

  @action
  updateItem(index, key, value) {
    const list = this.list.slice()
    list[index][key] = value
    this.list = list
  }

  @action
  setList(list = []) {
    if (!list.length) return
    this.list = _.map(list, (v) => ({
      ...v,
      customer: {
        value: v.customer.customer_id,
        text: v.customer.customer_name,
      },
    }))
  }

  @action
  customerSearch(reSearch = false) {
    if (!reSearch && this.customerList.length > 0) {
      return Promise.resolve(this.customerList.slice())
    }

    return Request('/station/order/customer/search')
      .get()
      .then((json) => {
        const list = resNameSortByFirstWord(
          _.map(json.data.list, (customer) => ({
            value: customer.address_id,
            text: customer.resname,
            resname: `${customer.resname}(${convertNumber2Sid(
              customer.address_id
            )}/${customer.username})`,
            username: customer.username,
          }))
        )
        this.customerList = list
        return list
      })
  }
}

export default new Store()
