import { action, observable, runInAction } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
// import _ from 'lodash'

class Store {
  @observable filter = {
    begin: moment().startOf('day').add(-7, 'd'),
    end: moment().startOf('day'),
    q_spu: '',
    q_sheet_num: '',
    q_operator: '',
    examine_type: '',
    change_type: '0',
  }

  @observable list = []

  doFirstRequest = () => {}

  @action
  init(spu_id) {
    this.filter = {
      ...this.filter,
      q_spu: spu_id,
    }
  }

  @observable loading = false

  @action.bound
  fetchList(paramsFromManagePaginationV2 = {}) {
    const params = this.getRequestParams()
    this.loading = true

    return Request('/stock/change_log/list')
      .data({ ...params, ...paramsFromManagePaginationV2 })
      .get()
      .then((json) => {
        const { data } = json
        runInAction(() => {
          this.list = this.processList(data)
        })
        return json
      })
      .finally(() => (this.loading = false))
  }

  asyncExportExcel() {
    const params = this.getRequestParams()

    return Request('/stock/change_log/export')
      .data(params)
      .get()
      .then((json) => {
        return json
      })
  }

  getRequestParams() {
    const {
      q_spu,
      q_sheet_num,
      q_operator,
      change_type,
      examine_type,
      begin,
      end,
    } = this.filter

    return {
      q_spu: q_spu.trim() || null,
      q_sheet_num: q_sheet_num.trim() || null,
      q_operator: q_operator.trim() || null,
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      change_type,
      review_status: examine_type || undefined,
    }
  }

  processList(list) {
    return list.map((item) => ({
      ...item,
      create_time: moment(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
    }))
  }

  @action
  handleResetFilter() {
    this.filter = {
      begin: moment().startOf('day').add(-7, 'd'),
      end: moment().startOf('day'),
      q_spu: '',
      q_sheet_num: '',
      q_operator: '',
      change_type: '0',
      examine_type: '',
    }
  }

  @action
  setFilterQ(q, q_type) {
    this.filter[q_type] = q
  }

  @action
  setFilterChangeType(change_type) {
    this.filter.change_type = change_type
  }

  @action
  setFilterExamineType(examine_type) {
    this.filter.examine_type = examine_type
  }

  @action
  setFilterTime(begin, end) {
    this.filter.begin = begin
    this.filter.end = end
  }

  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }
}

export default new Store()
