import { action, observable, runInAction } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'

class Store {
  @observable filter = {
    start_time: new Date(),
    end_time: new Date(),
    level: { value: null, text: t('全部等级') },
    status: null,
    q: ''
  }

  @action mergeFilter = filter => {
    Object.assign(this.filter, filter)
  }

  @observable loading = false
  @observable selectedList = [] // 选择的列表
  @observable isSelectAllPage = false // 是否全选页

  @observable list = []

  getRequestFilter = () => {
    const { start_time, end_time, level, ...rest } = this.filter
    return {
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      level_id: level ? level.value : null,
      ...rest
    }
  }

  @action
  fetchList = (pagination = null) => {
    const filter = {
      ...this.getRequestFilter(),
      ...pagination,
      export: 0
    }
    this.loading = true
    return Request('/community/withdraw/list')
      .data(filter)
      .get()
      .then(json => {
        runInAction(() => {
          this.list = json.data
        })
        return json
      })
      .finally(() => {
        runInAction(() => {
          this.loading = false
        })
      })
  }

  @action
  setDoFirstRequest = func => {
    this.doFirstRequest = func
  }

  @action
  selected = selected => {
    if (selected.length !== this.list.length) {
      this.isSelectAllPage = false
    }
    this.selectedList = selected
  }

  @action
  clearSelect = () => {
    this.selectedList.clear()
  }

  @action
  selectAllPage = bool => {
    this.isSelectAllPage = bool
    if (bool) {
      this.selectedList = _.map(this.list, v => v.id)
    }
  }

  @action
  approveWithdraw = id => {
    const params = this.getRequestFilter()
    if (!this.isSelectAllPage) {
      // 有id说明是在操作中点提现
      params.ids = JSON.stringify(id ? [id] : this.selectedList.slice())
    }
    return Request('/community/withdraw/submit')
      .data(params)
      .post()
      .then(() => {
        this.fetchList()
      })
  }

  @action
  handleExport() {
    return Request('/community/withdraw/list')
      .data({
        ...this.getRequestFilter(),
        export: 1
      })
      .get()
  }
}

export const store = new Store()
