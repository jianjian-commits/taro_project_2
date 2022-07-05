import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  @observable orderReportPrintDetail = {
    resname: '',
    date_time: '',
    district_name: '',
  }

  @observable orderReportSPUList = []

  @action.bound
  getDetail(id) {
    return Request(`/station/order/edit`)
      .data({ id: id, is_duplicate_sku: 1 })
      .get()
      .then((json) => {
        const customer = json.data && json.data.customer
        const date_time = json.data && json.data.date_time
        const district_name = json.data && json.data.district_name
        const resname =
          (customer.extender && customer.extender.resname) ||
          i18next.t('数据错误!!!')
        const data = {
          resname,
          date_time,
          district_name,
        }
        this.orderReportPrintDetail = data
      })
  }

  @action.bound
  getDetectSpus(order_id) {
    const data = {
      order_id,
    }
    return Request('/station/order/pesticide_detect_spus')
      .data(data)
      .get()
      .then((json) => {
        this.orderReportSPUList = json.data
      })
  }
}

export default new Store()
