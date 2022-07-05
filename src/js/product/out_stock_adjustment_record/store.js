import moment from 'moment'
import { action, computed, observable } from 'mobx'
import { Request } from '@gm-common/request'

const date = moment().startOf('day')

const initFilter = {
  begin_time: date,
  end_time: date,
  q: '',
}

const initDetail = {
  sheet_no: '',
  adjust_sheet_no: '',
  creator: '',
  submit_time: '-',
  details: [],
}

class AdjustmentRecord {
  @observable filter = { ...initFilter }
  @observable list = []
  @observable detail = { ...initDetail }

  @action
  initList() {
    this.filter = { ...initFilter }
    this.list = []
  }

  @action
  initDetailData() {
    this.detail = { ...initDetail }
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  setFilterDate(begin, end) {
    this.filter.begin_time = begin
    this.filter.end_time = end
  }

  @computed
  get getFilterParam() {
    const { begin_time, end_time, q } = this.filter
    const params = {
      begin_time: moment(begin_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
    }

    if (q) {
      params.q = q
    }
    return params
  }

  // 搜索出库调整单列表
  @action
  fetchData(pagination = {}) {
    const params = {
      ...this.getFilterParam,
      ...pagination,
    }
    return Request('/stock/out_stock_adjust_sheet/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.list = json.data
          return json
        })
      )
  }

  // 出库调整单详情
  @action
  getDetail(id) {
    return Request('/stock/out_stock_adjust_sheet/detail')
      .data({ sheet_no: id })
      .get()
      .then(
        action((json) => {
          this.detail = json.data
          return json
        })
      )
  }

  setPagination(pagination) {
    this.pagination = pagination
  }
}

export default new AdjustmentRecord()
