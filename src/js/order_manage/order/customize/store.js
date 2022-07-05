import { Request } from '@gm-common/request'
import { observable, action } from 'mobx'

export const init = {
  object_type: 0,
  field_type: 0,
  search_text: '',
}

export const initRadioItem = { id: undefined, name: '' }

export const initDetail = {
  id: undefined,
  field_name: '',
  field_type: 1,
  radio_list: [{ ...initRadioItem }],
  object_type: 1,
  permission: {
    write_station: 1,
    write_bshop: 0,
    write_yunguanjia: 0,
    read_station_order: 1,
    read_bshop_order: 1,
    read_station_purchase: 0,
    read_app_purchase: 0,
    read_station_picking: 0,
    read_station_sorting: 0,
    read_station_delivery: 0,
    read_app_driver: 0,
    read_ma_statement: 0,
    read_ma_settle: 0,
    read_ma_after_sale: 0,
    read_ma_order_report: 0,
    read_ma_abnormal_report: 0,
  },
}

class Store {
  @observable list = []
  @observable filter = { ...init }
  @observable detail = { ...initDetail }

  @action
  initDetail() {
    this.detail = { ...initDetail }
  }

  @action
  init() {
    this.filter = { ...init }
    this.list = []
  }

  @action.bound
  fetchList() {
    Request('/station/customized_field/list')
      .data({
        object_type: this.filter.object_type || undefined,
        field_type: this.filter.field_type || undefined,
        search_text: this.filter.search_text,
      })
      .get()
      .then((json) => {
        this.list = json.data
      })
  }

  @action
  updateFilter(key, value) {
    this.filter[key] = value
  }

  @action
  updateDetail(key, value) {
    this.detail[key] = value
  }

  @action
  permissionUpdate(key, value) {
    this.detail.permission[key] = value
  }

  @action
  create() {
    return Request('/station/customized_field/create')
      .data({
        ...this.detail,
        permission: JSON.stringify(this.detail.permission),
        radio_list:
          this.detail.field_type === 2
            ? JSON.stringify(this.detail.radio_list)
            : undefined,
      })
      .post()
  }

  @action
  update() {
    const { id, radio_list, permission, field_type } = this.detail
    return Request('/station/customized_field/update')
      .data({
        id,
        permission: JSON.stringify(permission),
        radio_list: field_type === 2 ? JSON.stringify(radio_list) : undefined,
      })
      .post()
  }

  @action.bound
  getDetailById(id) {
    return Request('/station/customized_field/detail')
      .data({
        id,
      })
      .get()
      .then((json) => {
        this.detail = json.data
      })
  }
}

export default new Store()
