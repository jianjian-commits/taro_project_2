import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

class Store {
  @observable filter = {
    levelSelected: null, // 团长等级
    check_status: '', // 团长状态
    q: ''
  }

  @observable commanderList = []
  @observable loading = false
  @observable selected = [] // 选中的数据
  @observable isSelectAllPage = false // 是否选中所有页
  @observable editStatus = 2 // 单个修改团长状态的值
  @observable batchEditStatus = 2 // 批量修改团长状态的值

  @action
  setValue(selected, key) {
    this.filter = {
      ...this.filter,
      [key]: selected
    }
  }

  @action
  setDoFirstRequest(func) {
    // apiDoFirstRequest有ManagePaginationV2提供
    this.apiDoFirstRequest = func
  }

  // 处理传给后端的参数
  @action
  getParams() {
    const { q, check_status, levelSelected } = this.filter
    return {
      q,
      check_status,
      level_id: levelSelected ? levelSelected.value : null
    }
  }

  @action
  fetchList(pagination) {
    const filter = this.getParams()
    this.loading = true
    return Request('/community/distributor/list')
      .data({
        ...pagination,
        ...filter,
        export: 0
      })
      .get()
      .then(
        action(json => {
          this.loading = false
          this.commanderList = json.data
          return json
        })
      )
  }

  @action
  handleExport() {
    const filter = this.getParams()
    return Request('/community/distributor/list')
      .data({
        ...filter,
        export: 1
      })
      .get()
  }

  @action
  setSelected(selected) {
    if (selected.length !== this.commanderList.length) {
      this.isSelectAllPage = false
    }
    this.selected = selected
  }

  @action
  setSelectAll(bool) {
    this.isSelectAllPage = bool
    if (this.isSelectAllPage) {
      this.selected = _.map(this.commanderList, v => v.id)
    }
  }

  @action
  setEditStatus(value) {
    this.editStatus = value
  }

  // 单个修改团长状态
  @action
  handleEditStatus(id) {
    return Request('/community/distributor/batch_edit')
      .data({
        ids: JSON.stringify([id]),
        set_data: JSON.stringify({ status: this.editStatus })
      })
      .post()
  }

  // 批量修改团长状态
  @action
  handleEditStatusBatch() {
    const filter = this.isSelectAllPage ? this.getParams() : {}

    const req = {
      ids: this.isSelectAllPage ? null : JSON.stringify(this.selected),
      set_data: JSON.stringify({
        status: this.editStatus
      }),
      ...filter
    }

    return Request('/community/distributor/batch_edit')
      .data(req)
      .post()
  }
}
export default new Store()
