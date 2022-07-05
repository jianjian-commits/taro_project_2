import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { Storage } from '@gmfe/react'

const ROOT_KEY = 'list_sort_log_recycle_bin_sku_list'
const sortItem = Storage.get(ROOT_KEY)

const initFilter = {
  begin_time: new Date(),
  end_time: new Date(),
  q: '', // 搜索
  salemenuSelected: '',
  sort_direction: sortItem?.sort_direction,
  sort_by: sortItem?.sort_by,
}
const initPagination = {
  count: 0,
  offset: 0,
  limit: 10,
}
class SkuStore {
  @observable doFirstRequest = _.noop()

  @observable filter = initFilter

  @observable saleListFilter = []

  @observable list = []

  @observable isSelectAllPage = false

  @observable selectedList = []

  @observable pagination = initPagination

  @observable loading = false

  @action
  setDoFirstRequest = (func) => {
    // doFirstRequest有ManagePagination提供
    this.doFirstRequest = func
  }

  @action
  changeFilter = (name, value) => (this.filter[name] = value)

  @action
  sort(name) {
    const { sort_direction, sort_by } = this.filter

    let direction = 'asc'
    this.filter.sort_by = name
    if (!sort_direction || (sort_by === name && sort_direction === 'desc')) {
      direction = 'asc'
    } else {
      direction = 'desc'
    }
    this.filter.sort_direction = direction

    Storage.set(ROOT_KEY, { sort_by: name, sort_direction: direction })
  }

  @action.bound
  getSaleList() {
    return Request('/salemenu/sale/list')
      .get()
      .then((json) => {
        const saleList = _.map(json.data, (item) => ({
          text: item.name,
          value: item.id,
        }))

        this.saleListFilter = saleList
        return json.data
      })
  }

  @action
  fetchList = (pagination = initPagination) => {
    this.loading = true
    const params = {
      ...this.filter,
      ...this.postFilter,
      offset: pagination.offset,
      limit: pagination.limit,
    }

    return Request('/recycle_bin/sku/search')
      .data(params)
      .get()
      .then((res) => {
        this.loading = false
        const { data, code, pagination } = res
        if (code === 0) {
          this.list = data
          this.pagination = pagination
          this.isSelectAllPage = false
          this.selectedList = []
        }
        return res
      })
      .finally(() => {
        this.loading = false
      })
  }

  @action
  deleteSku = (ids) => {
    const params = ids ? { sku_ids: JSON.stringify(ids) } : this.postFilter

    return Request('/recycle_bin/sku/batch_delete').data(params).post()
  }

  @action
  recoverSku = (ids) => {
    const params = ids ? { sku_ids: JSON.stringify(ids) } : this.postFilter

    return Request('/recycle_bin/sku/recover').data(params).post()
  }

  @action
  selected = (selected) => {
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
  selectAllPage = (bool) => {
    this.isSelectAllPage = bool
    if (bool) {
      this.selectedList = _.map(this.list, (v) => v.sku_id)
    }
  }

  @action
  initFilter = () => (this.filter = initFilter)

  @action mergeFilter = (filter) => {
    Object.assign(this.filter, filter)
  }

  @computed
  get postFilter() {
    const { begin_time, end_time, salemenuSelected, q } = this.filter

    return {
      begin_time: moment(begin_time).format('YYYY-MM-DD 00:00:00'),
      end_time: moment(end_time).format('YYYY-MM-DD 23:59:59'),
      salemenu_id: salemenuSelected?.value || '',
      q,
    }
  }
}

export default new SkuStore()
