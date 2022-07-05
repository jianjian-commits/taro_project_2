import { observable, action, computed, set } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { getFormatShelfId, getFormatShelfName } from '../../../util'

const initTransferListItem = {
  // 待提交字段
  spu_id: null,
  out_batch_num: null,
  remark: null,
  in_shelf_id: null,
  out_amount: null,

  in_batch_status: 0, // 移入批次状态，2，正常；3，损坏；4，临期；5，过期

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

const initTransferReceiptDetail = {
  status: null,
  creator: null,
  submit_time: null,
  sheet_no: null,
  details: [],
}

class Store {
  @observable transferList = []

  @observable transferReceiptDetail = { ...initTransferReceiptDetail }

  // 编辑数据开始
  @observable editTransferList = []

  @observable spuList = []

  @observable receiptRemark = null

  // { batch_num: [1,2,3...], batch_num2: [1,2,3..],... } 1 => 批次不存在，2 => 货位不存在， 3 => 库存不足
  @observable errorBatchList = new Map()

  @observable errorData = new Map()

  @observable selectedIndex = null

  // 编辑数据结束

  @computed
  get canSubmit() {
    let canSubmit = true

    if (this.editTransferList.length === 0) {
      canSubmit = false
    }

    _.forEach(this.editTransferList, (v) => {
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

    _.forEach(this.editTransferList, (v, index) => {
      v.spuSelected ? (isSelected[index] = true) : (isSelected[index] = false)
    })

    return isSelected
  }

  @computed
  get isSelectedOutBatchNum() {
    const isSelected = []

    _.forEach(this.editTransferList, (v, index) => {
      v.out_batch_num ? (isSelected[index] = true) : (isSelected[index] = false)
    })

    return isSelected
  }

  @action
  clearDataDueToBatchNum(index) {
    this.editTransferList[index].shelfSelected = []
    this.editTransferList[index].in_shelf_id = null
    this.editTransferList[index].out_amount = null
  }

  @action
  changeReceiptRemark(value) {
    this.receiptRemark = value
  }

  @action
  changeSelectedIndex(value) {
    this.selectedIndex = value
  }

  @action
  changeSpuSelected(index, selected) {
    let transferItem = {}

    if (selected) {
      transferItem = {
        spuSelected: selected,
        batchSelected: [], // 清空后面关联的项
        spu_id: selected.id,
        category_1_name: selected.category_1_name,
        category_2_name: selected.category_2_name,
        std_unit_name: selected.std_unit_name,
      }

      Object.assign(
        this.editTransferList[index],
        { ...initTransferListItem },
        transferItem,
      )
    } else {
      Object.assign(this.editTransferList[index], {
        ...initTransferListItem,
      })
    }
  }

  @action
  changeShelfSelected(index, selected) {
    this.editTransferList[index].shelfSelected = selected
    this.editTransferList[index].in_shelf_id = selected[selected.length - 1]
  }

  @action
  changeTransferListCell(index, field, value) {
    set(this.editTransferList, index, {
      ...this.editTransferList[index],
      [field]: value,
    })
  }

  @action
  addTransferListItem() {
    this.editTransferList.push({ ...initTransferListItem })
  }

  @action
  deleteTransferListItemByIndex(index) {
    this.editTransferList.remove(this.editTransferList[index])

    if (this.editTransferList.length === 0) {
      this.editTransferList.push({ ...initTransferListItem })
    }
  }

  @action
  getEditTransferDataForPost(submitType) {
    const { receiptRemark } = this
    console.log('this.editTransferList', this.editTransferList)

    const details = []

    _.forEach(
      this.editTransferList,
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

    const canUpdateStatus = [1, 2, 4]

    const req = {
      sheet_no: this.transferReceiptDetail.sheet_no,
      status: submitType,
    }

    if (canUpdateStatus.includes(submitType) || !submitType) {
      req.remark = receiptRemark
      req.details = JSON.stringify(details)
    }

    return req
  }

  @action
  setEditTransferDataFromList() {
    const transferData = []
    const { details } = this.transferReceiptDetail

    _.forEach(details, (v) => {
      transferData.push(
        Object.assign(
          {},
          { ...initTransferListItem },
          {
            spu_id: v.spu_id,
            category_1_name: v.category_1_name,
            category_2_name: v.category_2_name,
            std_unit_name: v.unit_name,
            out_batch_num: v.out_batch_num,
            out_shelf_name: getFormatShelfName(v.out_shelf) || '未分配',
            out_shelf_id:
              v.out_shelf.length > 0
                ? v.out_shelf[v.out_shelf.length - 1].id
                : null,
            in_batch_status: v.in_batch_status,
            remain: v.remain,
            out_amount: v.out_amount,
            shelfSelected: getFormatShelfId(v.in_shelf),
            spuSelected: { text: v.spu_name, value: v.spu_id },
            in_shelf_id:
              v.in_shelf.length > 0
                ? v.in_shelf[v.in_shelf.length - 1].id
                : null,
            in_batch_num: v.in_batch_num,
            remark: v.remark,
          },
        ),
      )
    })

    this.editTransferList = transferData
  }

  @action
  setDataByErrorList(errorData) {
    const batchList = new Map()

    for (const [key, value] of Object.entries(errorData)) {
      batchList.set(key, [...value.type])

      _.each(this.editTransferList, (v, index) => {
        if (v.batch_num === key) {
          this.editTransferList[index].remain = value.remain
          if (value.type === 2) {
            this.editTransferList[index].shelfSelected = []
          }
        }
      })
    }

    this.errorBatchList = batchList
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
  postEditTransferListData(methodType) {
    const req = {
      ...this.getEditTransferDataForPost(methodType),
    }

    return Request('/stock/inner_transfer_sheet/update')
      .data(req)
      .post()
      .then((json) => {
        return json
      })
  }

  @action
  fetchTransferList(receiptNo) {
    const req = {
      sheet_no: receiptNo,
    }

    return Request('/stock/inner_transfer_sheet/detail')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.transferList = json.data.details
          this.transferReceiptDetail = json.data
          this.receiptRemark = json.data.remark

          if (json.data.batch_errors) {
            this.setDataByErrorList(json.data.batch_errors)
          }
          return json // 返回给pagination组件获取数据及pagination字段
        }),
      )
  }
}

export default new Store()
