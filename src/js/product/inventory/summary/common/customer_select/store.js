import { i18next } from 'gm-i18n'
import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { convertNumber2Sid } from '../../../../../common/filter'
class CustomerStore {
  @observable
  customerList = []

  @action
  async fetchCustomerList() {
    const json = await Request('/station/order/customer/search').get()

    const customerList = _.map(json.data.list, (customer) => ({
      value: customer.address_id, // 组件用
      resname: customer.resname, // input 用
      text: `${customer.resname}(${convertNumber2Sid(customer.address_id)}/${
        customer.username
      })`, // 下拉用
      // username: customer.username,
      // receiver_name: customer.receiver_name,
      // receiver_phone: customer.receiver_phone,
      // address: customer.address,
    }))
    // 手工建单
    customerList.unshift({
      value: 0,
      resname: i18next.t('临时商户'),
      text: i18next.t('临时商户'),
    })
    runInAction(() => {
      this.customerList = customerList
    })
  }
}
export default new CustomerStore()
