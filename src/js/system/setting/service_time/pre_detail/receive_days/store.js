import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  @observable filter = {
    q: '',
  }

  @observable loading = false

  @observable smmWeekdays = 0

  @observable customerList = {
    list: [],
    pagination: {
      more: false,
      page_obj: '',
    },
  }

  @action
  setFilter(key, value) {
    this.filter[key] = value
  }

  @action.bound
  getCustomerList = (time_config_id, pagination = {}) => {
    return Request('station/service_time/customer/weekday/list')
      .data({
        time_config_id,
        search_text: this.filter.q,
        ...pagination,
      })
      .get()
      .then((json) => {
        this.customerList = {
          list: json.data,
          pagination: json.pagination,
        }
        this.loading = false
        return json
      })
  }

  @action
  listExport = (time_config_id) => {
    return Request('/station/service_time/customer/weekday/export')
      .data({
        time_config_id,
        search_text: this.filter.q,
      })
      .get()
  }

  @action
  updateRow(index, row) {
    const list = this.customerList.list.slice()
    list[index] = { ...list[index], ...row }
    this.customerList.list = list
  }

  @action
  createOrUpdateCustomer(index, time_config_id) {
    const list = this.customerList.list.slice()
    const customer = list[index]
    const params = {
      time_config_id,
      id: customer.id || null,
      address_id: +customer.address_id.slice(1),
      customer_weekdays: customer.weekdays,
    }
    if (params.id) {
      return Request('/station/service_time/customer/weekday/update')
        .data(params)
        .post()
        .then((json) => {
          return json
        })
    } else {
      return Request('/station/service_time/customer/weekday/create')
        .data(params)
        .post()
        .then((json) => {
          return json
        })
    }
  }

  @action.bound
  getServiceTimeFromID(id) {
    return Request('/service_time/get')
      .data({ id })
      .get()
      .then((json) => {
        const { weekdays } = json.data.receive_time_limit
        console.log(weekdays)
        this.smmWeekdays = weekdays
      })
  }
}

export default new Store()
