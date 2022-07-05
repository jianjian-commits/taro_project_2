import { observable, action, computed } from 'mobx'
import _ from 'lodash'

class BatchSelectModalStore {
  // 缓存
  @observable catchData = observable.object({})
  @observable allSelected = observable.object({})

  /** 左侧 */
  @observable treeSelected = []
  @observable indeterminateSelected = []
  @observable active = []

  /** 右侧 */
  @observable table = []
  @observable tableSelected = []
  @observable tableLoad = false
  @observable disableIds = []

  // 缓存数据
  @action
  saveData(id, data) {
    this.catchData = {
      ...this.catchData,
      [id]: {
        data,
      },
    }
  }

  // 记录不可选的ids
  @action
  setDisableIds(ids) {
    this.disableIds = ids
  }

  // 设置半勾选
  @action
  setIndeterminateSelected(ids) {
    this.indeterminateSelected = ids
  }

  @action
  setTableLoad(flag) {
    this.tableLoad = flag
  }

  // 设置 tree 的选中 ids
  @action
  setActive(ids) {
    this.active = ids
  }

  // 设置 tree 的选择 ids
  @action
  setTreeSelected(ids) {
    this.treeSelected = ids
  }

  @action
  initStore() {
    // 缓存
    this.allSelected = observable.object({})

    /** 左侧 */
    this.treeSelected = []
    this.indeterminateSelected = []
    this.active = []

    /** 右侧 */
    this.table = []
    this.tableSelected = []
    this.disableIds = []
  }

  // 设置表格的选择ids
  @action
  setTableSelected(ids) {
    this.tableSelected = _.filter(ids, (v) => !_.includes(this.disableIds, v))
  }

  // 设置表格的展示数据
  @action
  setTable(data) {
    this.table = data
  }

  // 缓存全部的数据选择
  @action
  setAllSelected(id, selectedIds) {
    this.allSelected = {
      ...this.allSelected,
      [id]: _.filter(selectedIds, (v) => !_.includes(this.disableIds, v)),
    }
  }

  // 获取已缓存的 id
  @computed
  get catchIds() {
    return _.map(this.catchData, (v, n) => n)
  }

  // 获取已选择tree的 id
  @computed
  get allSelectedTreeIds() {
    return _.map(this.allSelected, (v, n) => n)
  }

  // 获取已选择总数
  @computed
  get sumSelectedCount() {
    return _.reduce(
      this.allSelected,
      (res, v, n) => {
        return res + v.length
      },
      0,
    )
  }
}

export default new BatchSelectModalStore()
