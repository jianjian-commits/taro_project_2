import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'
import { System } from '../../../../common/service'

class Store {
  @observable suppliers = {
    list: [],
    selected: null,
  }

  @observable error = {
    error_list: [],
    total_num: 0,
    error_num: 0,
  }

  @observable statistics = {
    address_num: 0,
    sku_num: 0,
  }

  @action
  editColumn(index, obj) {
    const list = this.error.error_list.slice()
    const target = list[index]
    list[index] = {
      ...target,
      ...obj,
    }
    this.error.error_list = list
  }

  @action
  setError(error) {
    this.error = error
  }

  // 获取所有供应商
  @action
  getSuppliers() {
    return Request('/supplier/search')
      .data({ limit: 0 })
      .get()
      .then((json) => {
        this.suppliers.list = json.data
      })
  }

  @action
  setSupplier(selected) {
    this.suppliers.selected = selected
  }

  @action
  clearSuppliers() {
    this.suppliers = {
      list: [],
      selected: null,
    }
  }

  @action
  setByBatch(params) {
    if (System.isC()) params.is_retail_interface = 1
    return Request('/supplier/priority_supplier/batch_set')
      .data(params)
      .post()
      .then(
        action((json) => {
          if (!json.data.async) {
            this.error = json.data
          }
          return json
        })
      )
  }

  @action
  updateByBatch(params, updateOne = false) {
    if (System.isC()) params.is_retail_interface = 1
    return Request('/supplier/priority_supplier/batch_update')
      .data(params)
      .post()
      .then(
        action((json) => {
          if (!updateOne && !json.data.async) {
            this.error = json.data
          }
          return json
        })
      )
  }

  @action
  cancelBatchSupplier(params) {
    return Request('/supplier/priority_supplier/delete').data(params).post()
  }

  @action
  getErrorListByTaskId(task_id) {
    return Request('/supplier/priority_supplier/batch_set/task')
      .data({ task_id })
      .get()
      .then(
        action((json) => {
          this.error = json.data
        })
      )
  }

  @action
  getStatistics(params) {
    return Request('/supplier/priority_supplier/statistics')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.statistics = json.data
        })
      )
  }

  // 删除优先供应商
  @action
  deletePrioritySupplier(id) {
    return Request('/supplier/priority_supplier/delete')
      .data({ ids: JSON.stringify([id]) })
      .post()
  }

  @action
  deleteUpdated(index) {
    const errorList = this.error.error_list.slice()
    const result = errorList.splice(index, 1)
    console.log(index, result, errorList)
    this.error.error_list = errorList
  }
}

export default new Store()
