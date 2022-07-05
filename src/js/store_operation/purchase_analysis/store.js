import { action, observable, computed } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { Tip } from '@gmfe/react'
import _ from 'lodash'

class Store {
  @observable
  analysisFilter = {
    dateType: '1',
    begin_time: moment().startOf('day'),
    end_time: moment().startOf('day'),
    search_text: '',
    viewType: 1,
    categoryFilter: {
      category1_ids: [],
      category2_ids: [],
      pinlei_ids: [],
    },
  }

  @observable
  categories = []

  @observable
  purchaseAnalysisList = []

  @observable
  purchaserList = []

  @observable
  supplierList = []

  @action
  init() {
    this.analysisFilter = {
      dateType: '1',
      begin_time: moment().startOf('day'),
      end_time: moment().startOf('day'),
      search_text: '',
      viewType: 1,
      categoryFilter: {
        category1_ids: [],
        category2_ids: [],
        pinlei_ids: [],
      },
    }
  }

  @action
  setAnalysisFilter(param) {
    const obj = Object.assign({}, this.analysisFilter, param)
    this.analysisFilter = obj
  }

  @action
  getParams() {
    const params = {
      q_type: this.analysisFilter.dateType,
      begin_time: moment(this.analysisFilter.begin_time).format('YYYY-MM-DD'),
      end_time: moment(this.analysisFilter.end_time).format('YYYY-MM-DD'),
      q:
        this.analysisFilter.search_text &&
        this.analysisFilter.search_text.trim(),
    }
    return params
  }

  @computed
  get categoryInfo() {
    const category1_ids = _.map(
      this.analysisFilter.category1_ids,
      (cate) => cate.id
    )
    const category2_ids = _.map(
      this.analysisFilter.category2_ids,
      (cate) => cate.id
    )
    const pinlei_ids = _.map(this.analysisFilter.pinlei_ids, (cate) => cate.id)
    const categories = {}
    category1_ids.length &&
      (categories.category1_ids = JSON.stringify(category1_ids))
    category2_ids.length &&
      (categories.category2_ids = JSON.stringify(category2_ids))
    pinlei_ids.length && (categories.pinlei_ids = JSON.stringify(pinlei_ids))
    return categories
  }

  @action
  getCategoriesAndPinLei() {
    let categories = []
    let cate1Map = {}
    let cate2Map = {}
    let pinleiMap = {}
    Promise.all([
      Request('/merchandise/category1/get').get(),
      Request('/merchandise/category2/get').get(),
      Request('/merchandise/pinlei/get').get(),
    ]).then((result) => {
      const category1 = result[0].data
      const category2 = result[1].data
      const pinlei = result[2].data

      _.each(category1, (cate1) => {
        cate1Map[cate1.id] = cate1
        cate1.children = []
        categories.push(cate1)
      })

      _.forEach(category2, (cate2) => {
        cate2Map[cate2.id] = cate2
        cate2.children = []
        if (
          cate1Map[cate2.upstream_id] &&
          cate1Map[cate2.upstream_id].children
        ) {
          cate1Map[cate2.upstream_id].children.push(cate2)
        }
      })

      _.each(pinlei, (pl) => {
        pinleiMap[pl.id] = pl
        cate2Map[pl.upstream_id].children.push(pl)
      })

      this.categories = categories
    })
  }

  @action.bound
  getPurchaseAnalyseList(pagination) {
    const { categoryFilter } = this.analysisFilter
    const category1_ids = _.map(categoryFilter.category1_ids, (v) => v.id)
    const category2_ids = _.map(categoryFilter.category2_ids, (v) => v.id)
    const pinlei_ids = _.map(categoryFilter.pinlei_ids, (v) => v.id)
    const params = {
      ...this.getParams(),
      view_type: this.analysisFilter.viewType,
      ...this.categoryInfo,
      ...pagination,
    }

    category1_ids.length > 0 &&
      (params.category1_ids = JSON.stringify(category1_ids))
    category2_ids.length > 0 &&
      (params.category2_ids = JSON.stringify(category2_ids))
    pinlei_ids.length > 0 && (params.pinlei_ids = JSON.stringify(pinlei_ids))

    return Request('/purchase/analyse/purchase/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.purchaseAnalysisList = json.data
          return json
        })
      )
  }

  @action
  purchaseAnalyseListExport() {
    const { categoryFilter } = this.analysisFilter
    const category1_ids = _.map(categoryFilter.category1_ids, (v) => v.id)
    const category2_ids = _.map(categoryFilter.category2_ids, (v) => v.id)
    const pinlei_ids = _.map(categoryFilter.pinlei_ids, (v) => v.id)
    const params = {
      ...this.getParams(),
      view_type: this.analysisFilter.viewType,
      ...this.categoryInfo,
    }

    category1_ids.length > 0 &&
      (params.category1_ids = JSON.stringify(category1_ids))
    category2_ids.length > 0 &&
      (params.category2_ids = JSON.stringify(category2_ids))
    pinlei_ids.length > 0 && (params.pinlei_ids = JSON.stringify(pinlei_ids))
    return Request('/purchase/analyse/purchase/export').data(params).get()
  }

  @action.bound
  getPurchaseList(pagination) {
    const params = {
      ...this.getParams(),
      ...pagination,
    }
    return Request('/purchase/analyse/purchaser/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.purchaserList = json.data
          return json
        })
      )
  }

  @action.bound
  getSupplierList(pagination) {
    const params = {
      ...this.getParams(),
      ...pagination,
    }

    return Request('/purchase/analyse/supplier/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.supplierList = json.data
          return json
        })
      )
  }
}

export default new Store()
