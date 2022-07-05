import { action, computed, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'

class Store {
  @observable doFirstRequest = _.noop()
  /**
   * @type {{date_type: number, q: string, end: Date, begin: Date, status: number}}
   */
  @observable filter = {
    date_type: 6,
    q: '',
    begin: new Date(),
    end: new Date(),
    status: 0,
    only_get_proc_id: 0, // 用于获取全部加工单的id，0 否 1是，默认0
  }

  @observable isSelectAllPage = false

  @action mergeFilter = (filter) => {
    Object.assign(this.filter, filter)
  }

  @observable list = []

  @observable loading = false

  @action fetchList = (pagination) => {
    this.loading = true
    return Request('/stock/process/process_order/list')
      .data({ ...pagination, ...this.searchFilter })
      .get()
      .then((result) => {
        runInAction(() => {
          const { data } = result
          this.list = data
          // 清空selected
          this.selected = []
          this.isSelectAllPage = false
        })
        return result
      })
      .finally(() => {
        runInAction(() => {
          this.loading = false
        })
      })
  }

  /**
   * @type {number[]}
   */
  @observable selected = []

  @action
  setDoFirstRequest = (func) => {
    // apiDoFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @action setSelected = (selected) => {
    if (selected.length !== this.list.length) {
      this.isSelectAllPage = false
    }
    this.selected = selected
  }

  @action
  setSelectAll(bool) {
    this.isSelectAllPage = bool
    if (this.isSelectAllPage) {
      this.selected = _.map(this.list, (v) => v.id)
    }
  }

  @action setBatchStockIn = async ({ filter_stock, merge }) => {
    const filter = {
      ...this.searchFilter,
      ids: JSON.stringify(this.isSelectAllPage ? [] : this.selected),
      filter_stock: filter_stock ? 1 : 0, // 是否过滤
      merge: merge ? 1 : 0, // 是否合并
    }

    return Request('/stock/process/process_order/create_sheet')
      .data(filter)
      .post()
  }

  @observable workshopList = []

  @action fetchWorkshopList = () => {
    return Request('/process/workshop/list')
      .data()
      .get()
      .then((result) => {
        runInAction(() => {
          const { data } = result
          this.workshopList = data
        })
        return result
      })
  }

  @observable recordLossFilter = {
    begin_time: new Date(),
    end_time: new Date(),
    workshop_id: 0,
  }

  @action mergeRecordLossFilter = (filter) => {
    Object.assign(this.recordLossFilter, filter)
  }

  @observable file = null

  @action setFile = (file) => {
    this.file = file
  }

  @action getDownloadFile = () => {
    return Request('/stock/process/process_order/attrition_export')
      .data(this.downloadFilter)
      .get()
  }

  @action uploadConfirm = () => {
    return Request('/stock/process/process_order/attrition_import')
      .data({ file: this.file })
      .post()
  }

  @action fetchListAllIds = () => {
    const req = { ...this.searchFilter, only_get_proc_id: 1 }
    return Request('/stock/process/process_order/list').data(req).get()
  }

  @action getCheckProductList = () => {
    const params = {
      ...this.searchFilter,
      // proc_order_custom_ids: JSON.stringify(this.selected),
    }

    return Request('/stock/process/process_order/create_sheet/check')
      .data(params)
      .get()
      .then((res) => res)
  }

  @computed get searchFilter() {
    const { begin, end, status, ...rest } = this.filter
    const option = {
      ...rest,
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    }
    if (status) {
      option.status = status
    }
    return option
  }

  @computed get downloadFilter() {
    const { workshop_id, begin_time, end_time } = this.recordLossFilter
    const filter = {
      date_type: this.filter.date_type,
      begin_time: moment(begin_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
    }
    if (workshop_id) {
      filter.workshop_id = workshop_id
    }
    return filter
  }
}

export default new Store()
