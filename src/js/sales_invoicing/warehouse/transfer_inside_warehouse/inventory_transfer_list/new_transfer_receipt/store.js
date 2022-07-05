import { action, computed, observable, set } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

// 含操作数据字段以及需要提交的数据字段
const initTransferListItem = {
  // 待提交字段
  spu_id: null,
  out_batch_num: null,
  remark: null,
  in_shelf_id: null,
  out_amount: null,
  in_batch_status: 2, // 移入批次状态，2，正常；3，损坏；4，临期；5，过期

  // 辅助操作字段
  shelfSelected: [],
  spuSelected: null,
  category_1_name: '-',
  category_2_name: '-',
  out_shelf_id: null,
  out_shelf_name: null,
  remain: null,
  std_unit_name: null,

  in_batch_num: null,
  in_shelf_name: null,
  name: null,
}

class Store {
  @observable newTransferList = [{ ...initTransferListItem }]

  @observable spuList = []

  @observable shelfList = []

  @observable receiptRemark = null

  // errorBatchList{ batch_num: [1,2,3...], batch_num2: [1,2,3..],... } 1 => 批次不存在，2 => 货位不存在， 3 => 库存不足
  @observable errorBatchList = new Map()

  @observable errorData = new Map()

  @observable selectedIndex = null

  @computed
  get canSubmit() {
    let canSubmit = true

    if (this.newTransferList.length === 0) {
      canSubmit = false
    }

    _.forEach(this.newTransferList, (v) => {
      if (
        !v.spu_id ||
        !v.out_batch_num ||
        !v.out_amount ||
        !v.in_shelf_id ||
        !v.in_batch_status
      ) {
        canSubmit = false
      }
    })

    return canSubmit
  }

  @computed
  get isSelectedMerchandise() {
    const isSelected = []

    _.forEach(this.newTransferList, (v, index) => {
      v.spuSelected ? (isSelected[index] = true) : (isSelected[index] = false)
    })

    return isSelected
  }

  @computed
  get isSelectedOutBatchNum() {
    const isSelected = []

    _.forEach(this.newTransferList, (v, index) => {
      v.out_batch_num ? (isSelected[index] = true) : (isSelected[index] = false)
    })

    return isSelected
  }

  @action
  clearOperatedData() {
    this.newTransferList = [{ ...initTransferListItem }]
  }

  @action
  clearDataDueToBatchNum(index) {
    this.newTransferList[index].shelfSelected = []
    this.newTransferList[index].in_shelf_id = null
    this.newTransferList[index].out_amount = null
  }

  @action
  changeSelectedIndex(value) {
    this.selectedIndex = value
  }

  @action
  changeReceiptRemark(value) {
    this.receiptRemark = value
  }

  @action
  changeSpuSelected(index, selected) {
    let transferItem = {}

    if (selected) {
      transferItem = {
        spuSelected: selected,
        spu_id: selected.id,
        category_1_name: selected.category_1_name,
        category_2_name: selected.category_2_name,
        std_unit_name: selected.std_unit_name,
      }

      Object.assign(
        this.newTransferList[index],
        { ...initTransferListItem },
        transferItem,
      )
    } else {
      Object.assign(this.newTransferList[index], {
        ...initTransferListItem,
      })
    }
  }

  @action
  changeShelfSelected(index, selected) {
    this.newTransferList[index].shelfSelected = selected
    this.newTransferList[index].in_shelf_id = selected[selected.length - 1]
  }

  @action
  changeTransferListCell(index, field, value) {
    set(this.newTransferList, index, {
      ...this.newTransferList[index],
      [field]: value,
    })
  }

  @action
  addTransferListItem() {
    this.newTransferList.push({ ...initTransferListItem })
  }

  @action
  deleteTransferListItemByIndex(index) {
    this.newTransferList.remove(this.newTransferList[index])

    if (this.newTransferList.length === 0) {
      this.newTransferList.push({ ...initTransferListItem })
    }
  }

  @action
  setDataByErrorList(errorData) {
    const batchList = new Map()

    for (const [key, value] of Object.entries(errorData)) {
      batchList.set(key, [...value.type])
      _.each(this.newTransferList, (v, index) => {
        if (v.batch_num === key) {
          this.newTransferList[index].remain = value.remain

          if (value.type === 2) {
            this.editTransferList[index].shelfSelected = []
          }
        }
      })
    }

    this.errorBatchList = batchList
  }

  @action
  getNewTransferDataForPost(submitType) {
    const { receiptRemark } = this

    const details = []

    _.forEach(
      this.newTransferList,
      (
        {
          spu_id,
          out_batch_num,
          remark,
          in_shelf_id,
          out_amount,
          in_batch_status,
        },
        index,
      ) => {
        details[index] = {
          spu_id,
          out_batch_num,
          remark,
          in_shelf_id,
          in_batch_status, // 移入批次状态，2，正常；3，损坏；4，临期；5，过期
          out_amount,
        }
      },
    )

    return {
      status: submitType,
      remark: receiptRemark,
      details: JSON.stringify(details),
    }
  }

  @action
  searchSkuList(value = '') {
    return Request('/merchandise/spu/simple_search')
      .data({
        q: value,
      })
      .get()
      .then((json) => {
        const list = []

        _.each(json.data, (d, index) => {
          list[index] = {
            ...d,
            text: d.name,
            value: d.id,
          }
        })
        this.spuList = list

        return json
      })
  }

  /**
   * @param methodType:
   *   1: 保存，
   *   2：送审，
   *   3：审核不通过，
   *   4：确认移库
   *   5：冲销
   */
  @action
  postNewTransferListData(methodType) {
    const req = {
      ...this.getNewTransferDataForPost(methodType),
    }

    return Request('/stock/inner_transfer_sheet/create')
      .data(req)
      .post()
      .then((json) => {
        return json
      })
  }
}

export default new Store()
