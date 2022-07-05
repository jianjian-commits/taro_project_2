import { i18next } from 'gm-i18n'
import { observable, action, toJS } from 'mobx'
import {
  getSkuByName,
  getProcessOrderStock,
  getMaterialBatch,
  getSemiBatch,
  postCreateDetail,
  postUpdateDetail,
  postDeleteDetail,
  processPlanDetailGet,
} from '../api'

import _ from 'lodash'
import moment from 'moment'

const idTransValue = (list) =>
  _.map(list, (item) => {
    item.value = item.id
    return item
  })

class PlanDetailStore {
  // detail信息
  @observable detail = {}
  // 计划编号
  @observable custom_id = ''
  // 生产成品
  @observable product = {}
  // 当前待出库
  @observable currentStock = []
  // 计划生产数
  @observable plan_amount = 1
  // 投料类型
  @observable feederType = 1
  @observable feederTypeList = [
    {
      name: i18next.t('原料'),
      value: 1,
    },
    {
      name: i18next.t('半成品'),
      value: 2,
    },
  ]

  // modal
  // 投放数
  @observable put_amount = ''
  // 工艺筛选
  @observable technic_flow = []
  // 批次 list
  @observable batchList = []
  // 已选择批次
  @observable selectedBatch = ''

  // 计划开始时间
  @observable startDate = null

  // 计划完成时间
  @observable completeDate = null

  // 选择领取批次
  @observable batch = {
    // 投放数
    put_amount: '',
    // 已选择批次号
    selectedBatch: '',
  }
  // 选择领取批次 (备份)
  @observable batchBackup = {
    // 投放数
    put_amount: '',
    // 已选择批次号
    selectedBatch: '',
  }

  // 批次
  @observable batchObject = {}

  // 半成品：已完成的工艺同步
  @observable flowsDoneList = []
  @observable selectedIndexList = []
  @observable mobxDoneList = []
  @observable mobxFlowList = []

  // 是否修改了批次
  @observable hasChangeBatch = false
  // 半成品：选中 需要同步的已完成同步工艺
  @observable flowSyncSelectList = []

  @action
  setFlowsDoneList(selectedIndex, index) {
    const doneList = toJS(this.mobxDoneList)

    let selectedIndexList = []
    const preDoneList = _.map(doneList, (item, i) => {
      if (i === index) {
        item.selectedIndex = selectedIndex
      }
      return item
    })

    _.each(preDoneList, (item) => {
      if (item.selectedIndex !== '' && item.selectedIndex !== undefined) {
        selectedIndexList.push(item.selectedIndex)
      }
    })

    this.selectedIndexList = selectedIndexList

    this.mobxDoneList = preDoneList
  }

  @action
  setDoneAndFlowList(doneList, flowList) {
    const mobxFlowList = _.map(flowList, (item, i) => {
      item.index = i
      item.value = i
      return item
    })

    const mobxDoneList = _.filter(doneList, (item) => {
      item.selectedIndex = ''
      return _.find(
        mobxFlowList,
        (flowItem) => flowItem.technic_id === item.technic_id
      )
    })

    this.mobxDoneList = _.map(mobxDoneList, (item) => {
      item.flowList = _.filter(
        mobxFlowList,
        (flowItem) => flowItem.technic_id === item.technic_id
      )
      return item
    })
    this.mobxFlowList = mobxFlowList
  }

  @action
  setFilterChange(name, value) {
    this[name] = value
  }

  @action
  searchForSkuProduct(name) {
    return getSkuByName(name)
  }

  // 获取待出库数
  @action
  getProcessOrderStock(sku_id) {
    return getProcessOrderStock({ sku_id })
  }

  @action
  getMaterialBatch(sku_id) {
    return getMaterialBatch(sku_id).then(
      action((json) => {
        this.technic_flow = idTransValue(json.data.technic_flow)
        this.batchList = json.data.batchs
      })
    )
  }

  @action
  getSemiBatch(sku_id) {
    return getSemiBatch(sku_id).then(
      action((json) => {
        this.technic_flow = idTransValue(json.data.technic_flow)
        this.batchList = json.data.batchs
        return this.batchList
      })
    )
  }

  @action
  setBatchSelected(index, value) {
    const list = _.map(this.batchs, (item) => {
      item._gm_select = false
      return item
    })

    list[index]._gm_select = value
    this.batchs = list
  }

  // 设置批次信息 (备份)
  @action
  setBatchBackup(name, value) {
    this.batchBackup[name] = value
  }

  // 备份
  @action
  batchBackupAction() {
    const batch = Object.assign({}, this.batch)
    this.batchBackup = batch
  }

  @action
  clearBatchBackup() {
    this.batchBackup = {
      // 投放数
      put_amount: '',
      // 已选择批次号
      selectedBatch: '',
    }
  }

  // 确认同步
  @action
  confirmAndSync() {
    const backup = Object.assign({}, this.batchBackup)
    this.batch = backup
  }

  getDetail() {
    const sku_id = this.product.id || this.product.id
    const plan_amount = this.plan_amount
    const custom_id = this.custom_id
    const type = this.feederType
    const batch_num = this.batch.selectedBatch
    const plan_start_time = moment(this.startDate).format('YYYY-MM-DD')
    const plan_finish_time = moment(this.completeDate).format('YYYY-MM-DD')
    return {
      sku_id,
      plan_amount,
      type,
      batch_num,
      plan_start_time,
      plan_finish_time,
      custom_id,
    }
  }

  isReadyPost() {
    const sku_id = this.product.id || this.product.id
    const custom_id = this.custom_id
    const plan_amount = this.plan_amount
    const plan_finish_time =
      this.completeDate && moment(this.completeDate).format('YYYY-MM-DD')
    const plan_start_time =
      this.startDate && moment(this.startDate).format('YYYY-MM-DD')

    if (
      !custom_id ||
      !sku_id ||
      !plan_amount ||
      !plan_finish_time ||
      !plan_start_time
    ) {
      // 外部页面填写不完整
      return 1
    }
    return 0
  }

  @action
  clearDetail(exceptId = false) {
    if (!exceptId) {
      this.product = {}
    }
    this.currentStock = []
    this.plan_amount = ''
    this.batch = {
      // 投放数
      put_amount: '',
      // 已选择批次号
      selectedBatch: '',
    }
    this.batchBackup = {
      // 投放数
      put_amount: '',
      // 已选择批次号
      selectedBatch: '',
    }
    this.completeDate = null
    // 清除detail
    this.detail = Object.assign(
      {},
      {
        custom_id: this.detail.custom_id,
      }
    )
    // 半成品投料：完成工艺中是否有重复工艺
    this.flowsDoneList = []
  }

  @action
  clearBatch() {
    this.batch = {
      // 投放数
      put_amount: '',
      // 已选择批次号
      selectedBatch: '',
    }
    this.batchBackup = {
      // 投放数
      put_amount: '',
      // 已选择批次号
      selectedBatch: '',
    }
  }

  // 获取详情
  @action
  processPlanDetailGet(data) {
    return processPlanDetailGet(data).then(
      action((json) => {
        const data = json.data
        this.detail = data
        this.custom_id = data.custom_id
        this.id = data.id
        this.product = Object.assign(data, {
          id: data.sku_id,
          value: data.sku_id,
          name: data.sku_name,
        })
        this.plan_amount = data.plan_amount
        this.feederType = data.material_type
        this.startDate = data.plan_start_time
        this.completeDate = data.plan_finish_time
        this.technic_flow = data.technic_flow
        this.batch = {
          // 投放数
          put_amount: data.plan_recv_amount || '',
          // 已选择批次号
          selectedBatch: data.batch_num,
        }

        getProcessOrderStock({
          sku_id: data.sku_id,
          version: data.sku_version,
        }).then(
          action((json) => {
            this.currentStock = json.data
          })
        )
      })
    )
  }

  @action
  postCreate() {
    let data = this.getDetail()

    if (data.type === 2) {
      const finish_technics = toJS(this.mobxDoneList)
      const preFilterList = _.filter(finish_technics, (item) => item._gm_select)
      const filterList = _.map(preFilterList, (item) => ({
        technic_id: item.technic_id,
        index: item.selectedIndex,
      }))

      data = Object.assign({}, data, {
        finish_technics: JSON.stringify(filterList),
      })
    }
    return postCreateDetail(data)
  }

  @action
  postUpdate(id) {
    let data = Object.assign({}, this.getDetail(), { id })

    if (data.type === 2) {
      const finish_technics = toJS(this.mobxDoneList)
      const preFilterList = _.filter(finish_technics, (item) => item._gm_select)
      const filterList = _.map(preFilterList, (item) => ({
        technic_id: item.technic_id,
        index: item.selectedIndex,
      }))

      data = Object.assign({}, data, {
        finish_technics: JSON.stringify(filterList),
      })
    }
    return postUpdateDetail(data)
  }

  @action
  postDelete(id) {
    return postDeleteDetail(id)
  }
}

export default new PlanDetailStore()
