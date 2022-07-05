import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

const initTask = {
  result: {
    tasks: [], // 修改失败的采购任务
    failure_count: 0,
    success_count: 0,
    type: 1, // 1：修改供应商，2：修改采购员
  },
}

class BatchModifyStore {
  @observable
  selectedList = [] // 保存表格中每一行选择过的供应商或者采购员

  @observable
  optionalList = [] // 保存表格中每一行可选择修改的供应商或者采购员

  @observable
  task = initTask

  @action
  init() {
    this.suppliers = []
    this.purchasers = []
    this.selectedList = []
    this.task = initTask
    this.optionalList = []
  }

  @action
  setSelectedList(index, selected) {
    const list = this.selectedList.slice()
    list[index] = selected
    this.selectedList = list
  }

  @action
  updateTask(ids, { settle_supplier_id = null, purchaser_id = null }) {
    return Request('/purchase/task/change_settle_supplier')
      .data({
        ids: JSON.stringify(ids),
        settle_supplier_id,
        purchaser_id,
      })
      .post()
  }

  @action
  getTaskById(id) {
    return Request('/task/get')
      .data({ task_id: id })
      .get()
      .then(
        action((json) => {
          this.task = json.data
          return json
        })
      )
  }

  /**
   * @description 批量修改失败时拉取对应的供应商或者采购员，传spec_id拉可选的供应商，传settle_supplier_id拉取可选的采购员
   * @param {object} query 请求参数
   * @param {number} index 对应任务数组下标
   */
  @action
  getOptionalSuppliersPurchasers(query, index) {
    return Request('/purchase/task/optional_suppliers_purchasers')
      .data(query)
      .get()
      .then(
        action((json) => {
          const list = this.optionalList.slice()
          list[index] = json.data
          this.optionalList = list
        })
      )
  }
}

export default new BatchModifyStore()
