import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'

class Store {
  @observable filter = {
    dateType: '1',
    begin: new Date(),
    end: new Date(),
    levelSelected: null,
    q: '',
  }

  @observable commanderSettleList = []
  @observable loading = false
  @observable selected = []
  @observable isSelectAllPage = false

  @action
  setDoFirstRequest(func) {
    this.apiDoFirstRequest = func
  }

  @action
  setValue(key, value) {
    this.filter[key] = value
  }

  @action
  setDateFilterChange(filter) {
    const filterObj = { ...this.filter, ...filter }
    this.filter = filterObj
  }

  @action
  getParams() {
    const { begin, end, dateType, levelSelected, ...rest } = this.filter
    return {
      start_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
      query_type: +dateType,
      level_id: levelSelected ? levelSelected.value : null,
      ...rest,
    }
  }

  @action
  fetchList(pagination = null) {
    const filter = this.getParams()
    this.loading = true

    return Request('/community/settlement/list')
      .data({
        export: 0,
        ...filter,
        ...pagination,
      })
      .get()
      .then(
        action((json) => {
          this.commanderSettleList = json.data
          this.loading = false
          return json
        }),
      )
  }

  @action
  setSelectAll(bool) {
    this.isSelectAllPage = bool
    if (this.isSelectAllPage) {
      this.selected = _.map(this.commanderSettleList, (v) => v.username)
    }
  }

  @action
  setSelected(selected) {
    if (selected.length !== this.commanderSettleList.length) {
      this.isSelectAllPage = false
    }
    this.selected = selected
  }

  // 单个结算
  @action
  doSettlement(itemData) {
    return Request('/community/settlement/submit')
      .data({
        ids: JSON.stringify(itemData.unsettled_flow_ids),
      })
      .post()
  }

  // 批量结算
  @action
  doSettlementBatch() {
    const filter = this.isSelectAllPage ? this.getParams() : {}

    // 未结算的流水ids 扁平化处理
    const ids = _.flatten(
      _.map(this.selected, (item) => {
        const list = _.find(
          this.commanderSettleList,
          (o) => o.username === item,
        )
        return list.unsettled_flow_ids.slice()
      }),
    )

    const params = {
      ...filter,
      ids: this.isSelectAllPage ? null : JSON.stringify(ids),
    }

    return Request('/community/settlement/submit').data(params).post()
  }

  @action
  handleExport() {
    const filter = this.getParams()
    return Request('/community/settlement/list')
      .data({
        ...filter,
        export: 1,
      })
      .get()
  }
}

export default new Store()
