import { action, observable, computed, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import moment from 'moment'

class ReportStore {
  @observable doFirstRequest = _.noop()
  @observable list = [] // 生产报表列表

  @observable ingredientsList = [] // 加工单列表

  @observable filter = {
    begin: new Date(),
    end: new Date(),
    categoryFilter: {
      category1_ids: [],
      category2_ids: [],
    },
    q: '',
  } // 生产报表搜索条件

  @computed
  get categoryInfo() {
    const category1_ids = _.map(
      this.filter.categoryFilter.category1_ids,
      (cate) => cate.id
    )
    const category2_ids = _.map(
      this.filter.categoryFilter.category2_ids,
      (cate) => cate.id
    )
    const categories = {}
    category1_ids.length &&
      (categories.category1_ids = JSON.stringify(category1_ids))
    category2_ids.length &&
      (categories.category2_ids = JSON.stringify(category2_ids))

    return categories
  }

  @computed
  get filterSearchData() {
    const filter = {}
    if (this.filter.q !== '') {
      filter.q = this.filter.q
    }

    filter.begin = moment(this.filter.begin).format('YYYY-MM-DD')
    filter.end = moment(this.filter.end).format('YYYY-MM-DD')

    return Object.assign({}, filter, this.categoryInfo)
  }

  @action
  setList(name, index, value) {
    const newList = this.list.slice()
    newList[index][name] = value
    this.list = newList
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  getList(pagination) {
    const data = {
      ...this.filterSearchData,
      limit: 10,
      ...pagination,
    }

    return Request('/stock/process/report/list')
      .data(data)
      .get()
      .then((json) => {
        this.list = json.data
        return json
      })
  }

  @action
  getIngredientsList(data) {
    Request('/stock/process/report/process_order/get')
      .data(data)
      .get()
      .then((json) => {
        runInAction(() => {
          this.ingredientsList = json.data
        })
      })
  }

  @action
  getTechnic(data) {
    const { sku_id, begin, end, ingredient_id } = data
    const req = {
      sku_id,
      ingredient_id,
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    }

    return Request('/stock/process/report/technic/get')
      .data(req)
      .get()
      .then((json) => json.data)
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有paginationBox提供
    this.doFirstRequest = func
  }
}

export default new ReportStore()
