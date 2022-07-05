import { action, observable, computed, toJS } from 'mobx'
import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import moment from 'moment'
import { formatDate } from '../../../../common/util'
import { showTaskPanel } from '../../../../task/task_list'
import _ from 'lodash'
class Store {
  @observable
  selectedViewType = 1

  @observable
  filter = null

  @computed
  get isSpuView() {
    return this.selectedViewType === 1
  }

  @observable
  viewTypes = [
    {
      value: 1,
      name: i18next.t('按商品查看'),
    },
    {
      value: 2,
      name: i18next.t('按分类查看'),
    },
  ]

  @observable
  listLoading = false

  @observable
  list = []

  @observable
  amount = {
    spu_cnt: 0,
    data_cnt: 0,
    total_money: 0,
  }

  initFilter(extend) {
    const filter = {
      sort: null,
      sort_field: null,
      start_time: moment(),
      end_time: moment(),
      selectedCategory: {
        category1_ids: [],
        category2_ids: [],
      },
      q: '',
      ...extend,
    }
    this.filter = filter
  }

  getBaseParams() {
    let { start_time, end_time, q } = this.filter
    start_time = formatDate(start_time)
    end_time = formatDate(end_time)
    return {
      start_time,
      end_time,
      q,
    }
  }

  getCategoryQueryParams(isListSearch = false) {
    const params = this.getBaseParams()
    const { sort_field, sort } = this.filter
    let sortFields = {}
    if (isListSearch && sort_field) {
      sortFields = {
        sort: sort === 'asc' ? 1 : -1,
      }
    }

    return {
      ...params,
      ...sortFields,
    }
  }

  getSpuQueryParams(isListSearch = false) {
    const baseParams = this.getBaseParams()
    const { sort } = this.filter
    // 不需要传排序字段 order_by: sort_field,
    let sortFields = {}
    if (isListSearch && sort !== null) {
      sortFields = {
        sort: sort === 'asc' ? 1 : -1,
      }
    }

    const params = {
      ...baseParams,
      ...sortFields,
    }
    const getCateParams = (fields, allCates) => {
      const cateParams = {}
      fields.forEach((field, index) => {
        const cates = allCates[index]
        if (cates.length) {
          cateParams[field] = JSON.stringify(cates.map((cate) => cate.id))
        }
      })
      return cateParams
    }

    const { category1_ids, category2_ids } = toJS(this.filter.selectedCategory)
    Object.assign(
      params,
      getCateParams(
        ['category1_ids', 'category2_ids'],
        [category1_ids, category2_ids],
      ),
    )
    return params
  }

  getQueryParams() {
    throw new Error('should override')
  }

  setApi(api) {
    this.api = api
  }

  setPagination(p) {
    // 重新拉取 list 需要
    this.pagination = p
  }

  @action.bound
  handleViewTypeChange(val) {
    // 1. list/viewType change -> render 2. listLoading change -> render 3. response list -> render
    this.list = []
    const { start_time, end_time } = this.filter
    this.initFilter({ start_time, end_time })
    this.selectedViewType = val
    this.handleSearch()
  }

  handleSortFn(sort_field) {
    return () => this.handleSort(sort_field)
  }

  @action.bound
  handleSort(sort_field) {
    const sort = this.filter.sort === 'asc' ? 'desc' : 'asc'
    this.handleFilterChange({
      sort,
      sort_field,
    })
    this.handleSearch()
  }

  @action.bound
  handleSearch() {
    const error = this.validateQueryParams()
    if (error) {
      Tip.warning(error)
      return
    }
    const params = this.getQueryParams()
    const { fetchAmountBySpu, fetchAmountByCategory } = this.api
    const fetchAmount = this.isSpuView
      ? fetchAmountBySpu
      : fetchAmountByCategory
    fetchAmount(params).then(
      action((json) => {
        this.amount = json.data
      }),
    )
    this.pagination.apiDoFirstRequest()
  }

  @action.bound
  handleFilterChange(field, value) {
    if (_.isObject(field)) {
      Object.assign(this.filter, field)
    } else {
      this.filter[field] = value
    }
  }

  handleExport = () => {
    const { exportExcelBySpu, exportExcelByCategory } = this.api
    const params = this.getQueryParams()
    params.export = '1'
    const exportExcel = this.isSpuView
      ? exportExcelBySpu
      : exportExcelByCategory
    exportExcel(params).then(showTaskPanel)
  }

  @action
  fetchList = (pagination = {}) => {
    const params = {
      ...this.getQueryParams(true),
      ...pagination,
    }
    const { fetchListBySpu, fetchListByCategory } = this.api
    const fetchList = this.isSpuView ? fetchListBySpu : fetchListByCategory

    this.listLoading = true
    return fetchList(params).then(
      action((json) => {
        this.list = json.data
        this.listLoading = false
        json.pagination.count = this.amount.data_cnt
        return json
      }),
    )
  }
}

export default Store
