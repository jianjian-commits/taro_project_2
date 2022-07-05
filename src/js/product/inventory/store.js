import { observable, action, computed } from 'mobx'
import _ from 'lodash'
import globalStore from '../../stores/global'
import { Request } from '@gm-common/request'
import moment from 'moment'
import Big from 'big.js'

const initBatchFilter = {
  begin: moment().startOf('day').subtract(15, 'days'),
  end: moment().startOf('day'),
  q: '',
  spu_id: null,
}

const initPagination = {
  limit: 10,
  offset: 0,
}

// 目前store仅处理一键报损报溢模块,批量安全库存，批量呆滞库存
class Store {
  // 待盘点商品筛选条件
  selectFilter = {}
  @observable productTabType = 1
  // 记录接收当前页后台待盘点商品信息
  @observable reportOverflowLostList = []

  // 记录全部页的实盘数是否归零
  @observable isAllZero = false
  // 记录商品对应的实盘数
  @observable realStockNumberList = new Map()
  // 记录商品对应的备注信息
  @observable remarkList = new Map()

  // 记录当前页面批次信息
  @observable batchList = []
  // 记录分页勾选的批次，selectTable组件使用
  @observable batchSelected = []
  // 记录分页填写的批次对应报溢报损数
  @observable batchOverflowAndLostNumMap = new Map()
  // 记录全部商品的批次操作信息(确认后保存)
  @observable spuOperatedBatchMap = new Map() // 结构为map(key:spu_id, value:{selected:[], overflowAndLostNum})

  // 记录批次搜索条件
  @observable batchFilter = {
    ...initBatchFilter,
  }

  // 批量操作返回的错误列表Id
  @observable errorTaskId = ''
  @observable inventoryErrorList = []
  @observable errorPagination = {
    ...initPagination,
  }

  // 清除盘点页面操作的数据
  @action
  clearUnSubmitData() {
    this.realStockNumberList.clear()
    this.remarkList.clear()
    this.spuOperatedBatchMap.clear()
  }

  @action
  clearOperatedBatchData() {
    this.batchSelected = []
    this.batchOverflowAndLostNumMap.clear()
  }

  @action
  clearBatchFilter() {
    this.batchFilter = {
      ...initBatchFilter,
    }
  }

  // 计算报溢报损数
  @computed
  get overflowAndLostNumber() {
    const list = this.reportOverflowLostList.slice() // 是否需要
    const data = new Map()

    for (let i = 0; i < list.length; i++) {
      let sum = 0

      if (this.realStockNumberList.has(list[i].spu_id)) {
        const realNum = Big(this.realStockNumberList.get(list[i].spu_id) || 0)
        sum = realNum.minus(Big(list[i].remain || 0).toFixed(2))
      } else {
        sum = null
      }

      data.set(list[i].spu_id, sum)
    }

    return data
  }

  // 计算待分配数（待报溢数-已分配）
  @computed
  get unassignedNum() {
    // 根据spu_id对应报溢报损数
    const overflowLostNum = Big(
      this.overflowAndLostNumber.get(this.batchFilter.spu_id) || 0,
    ).abs()

    return Big(overflowLostNum || 0).minus(this.assignedNum || 0)
  }

  // 计算已分配数（当前商品所有批次报溢报损数相加）
  @computed
  get assignedNum() {
    let sum = 0

    this.batchOverflowAndLostNumMap.forEach((v, k) => {
      if (this.batchSelected.includes(k)) {
        sum = Big(v || 0).plus(sum || 0)
      }
    })

    return sum
  }

  @computed
  get isSelectBatchAll() {
    let check = false

    _.forEach(this.batchList, (v) => {
      if (!this.batchSelected.includes(v.batch_number)) {
        check = false
        return false
      } else {
        check = true
      }
    })

    return check
  }

  // 设置弹窗的已操作信息
  @action
  setSelectedData(isOverFlowType) {
    const { spu_id } = this.batchFilter

    // 若已选择批次并填写数据则恢复
    if (this.spuOperatedBatchMap.has(spu_id)) {
      this.batchSelected = this.spuOperatedBatchMap.get(spu_id).selected
      const currentBatchOverflowAndLostNum = this.spuOperatedBatchMap.get(
        spu_id,
      ).batchOverflowAndLostNum

      for (const [k, v] of currentBatchOverflowAndLostNum.entries()) {
        this.batchOverflowAndLostNumMap.set(
          k,
          isOverFlowType ? v : Big(v).abs(),
        )
      }
    } else {
      this.batchSelected = []
      this.batchOverflowAndLostNumMap = new Map()
    }
  }

  // 设置弹窗的spu_id
  @action
  setSpuId(spu_id) {
    this.batchFilter.spu_id = spu_id
  }

  // 设置获取待盘点商品的筛选信息
  @action
  setReportOverflowAndLostFilter(data) {
    this.selectFilter = _.omit({ ...data }, ['limit', 'offset'])
  }

  @action
  setErrorTaskId(taskId) {
    this.errorTaskId = taskId
  }

  // 改变待盘点商品的盘点数据
  @action
  changeReportOverflowLostData(index, value, name) {
    const spuId = this.reportOverflowLostList[index].spu_id

    if (name === 'realStockNumber') {
      this.realStockNumberList.set(spuId, value)

      // 若实盘数改变，先进先出时，清空批次操作信息
      if (this.spuOperatedBatchMap.has(spuId)) {
        this.spuOperatedBatchMap.delete(spuId)
      }
    } else if (name === 'remark') {
      this.remarkList.set(spuId, value)
    }

    if (name === 'realStockNumber' && !value && value !== 0) {
      if (this.isAllZero) {
        this.realStockNumberList.set(spuId, null)
      } else {
        // 若输入值为空则去掉该值---当作未修改
        this.realStockNumberList.delete(spuId)
        this.spuOperatedBatchMap.delete(spuId) // 若当前实盘数为空，则对应不填，清空该spuId操作的批次数据
      }
    }
  }

  // 改变批次筛选数据
  @action
  changeBatchFilter(name, value) {
    this.batchFilter[name] = value
  }

  // 改变批次报溢报损数
  @action
  changeBatchOverflowAndLostNumber(batchNumber, value) {
    this.batchOverflowAndLostNumMap.set(batchNumber, value)
  }

  // 改变批次选择
  @action
  changeBatchSelected(selected) {
    this.batchSelected = selected
  }

  @action
  changeSelectBatchAll() {
    if (this.isSelectBatchAll) {
      this.batchSelected = []
    } else {
      this.batchSelected = _.map(this.batchList, (v) => v.batch_number)
    }
  }

  @action
  saveOperatedBatchData(isOverFlowType, hideModal) {
    const {
      batchFilter: { spu_id },
      batchSelected,
      batchOverflowAndLostNumMap,
    } = this
    const batchOverflowAndLostNum = new Map()
    const selected = []

    _.forEach(batchSelected, (v) => {
      if (batchOverflowAndLostNumMap.has(v)) {
        // 就算select，但是未填写报溢报损数，不做记录
        selected.push(v)
        batchOverflowAndLostNum.set(
          v,
          isOverFlowType
            ? batchOverflowAndLostNumMap.get(v)
            : -batchOverflowAndLostNumMap.get(v),
        ) // 记录的数据都为正数，但是后台需要报溢传正数，报损传负数
      }
    })

    const selectedObject = {
      selected,
      batchOverflowAndLostNum,
    }

    this.spuOperatedBatchMap.set(spu_id, selectedObject)

    hideModal()
  }

  // 获取已盘点数据待提交信息
  @action
  getParamsData() {
    const postData = []
    let i = 0
    const { stock_method } = globalStore.user

    if (stock_method === 1) {
      // 加权平均，提交填写实盘数的数据
      for (const k of this.realStockNumberList.keys()) {
        // 在一键置零的情况下，如果对应实盘数为 null ，则传 None 给后台
        let new_stock = this.realStockNumberList.get(k)
        new_stock = new_stock !== null ? new_stock : 'None'
        // 有备注情况下，置零的数据也传
        if (!this.isAllZero || this.remarkList.has(k) || new_stock !== 0) {
          postData[i] = {
            spu_id: k,
            new_stock: new_stock,
            remark: this.remarkList.has(k) ? this.remarkList.get(k) : undefined,
          }
          i++
        }
      }
    } else if (stock_method === 2) {
      // 先进先出，已保存批次号数据的才提交
      for (const [spuId, v] of this.spuOperatedBatchMap.entries()) {
        _.forEach(v.selected, (item) => {
          postData.push({
            batch_number: item,
            remark: this.remarkList.has(spuId)
              ? this.remarkList.get(spuId)
              : undefined,
            delta: v.batchOverflowAndLostNum.get(item),
          })
        })
      }
    }
    if (this.isAllZero) {
      return {
        stock_details: JSON.stringify(postData),
        is_set_zero: this.isAllZero ? 1 : 0,
      }
    } else {
      return {
        stock_details: JSON.stringify(postData),
      }
    }
  }

  @action
  getBatchFilter() {
    const { begin, end, q, spu_id } = this.batchFilter

    return {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      q,
      spu_id,
    }
  }

  // 获取当前待盘点商品
  @action.bound
  getReportOverflowLostList(pagination = {}) {
    const reqData = {
      ...this.selectFilter,
      ...pagination,
    }

    return Request('/stock/check/list')
      .data(reqData)
      .get()
      .then(
        action((json) => {
          this.reportOverflowLostList = json.data

          return json
        }),
      )
  }

  // 获取当前待选择批次
  @action.bound
  getBatchList(pagination = {}) {
    const reqData = {
      ...this.getBatchFilter(),
      ...pagination,
    }

    return Request('/stock/check/batch_number/list')
      .data(reqData)
      .get()
      .then(
        action((json) => {
          this.batchList = json.data

          return json
        }),
      )
  }

  // 获取盘点错误的商品列表
  @action
  getErrorInventoryList(pagination) {
    if (pagination) {
      this.errorPagination = pagination
    }

    const req = {
      task_id: this.errorTaskId,
      ...this.errorPagination,
    }

    return Request('/stock/check/result')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.inventoryErrorList = json.data
          this.errorPagination = json.pagination

          return json
        }),
      )
  }

  // 提交盘点数据
  @action
  postReportOverflowLostData() {
    const req = Object.assign({}, this.getParamsData(), this.selectFilter)
    console.log(req)

    return Request('/stock/check/batch').data(req).post()
  }

  // 设置一键归零
  @action
  setIsAllZero(flag) {
    this.isAllZero = flag
  }

  // 重置一键归零
  @action
  cleanIsAllZero() {
    this.isAllZero = false
  }

  @action
  setBatchSafeStock(req) {
    return Request('/stock/check/safe_stock/batch_modify').data(req).post()
  }

  @action
  setBatchDelayStock(req) {
    return Request('/stock/check/retention_day/batch_modify').data(req).post()
  }
}

export default new Store()
