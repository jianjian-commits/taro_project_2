import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'

const initFilter = {
  begin_time: moment().startOf('day'),
  end_time: moment().startOf('day'),
  search_text: '',
  settle_supplier: null,
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  source: 0, // 询价来源
}
class Store {
  constructor() {
    this.doFirstRequest = _.noop()
  }

  inquirySource = [
    { value: 0, text: i18next.t('全部来源') },
    { value: 1, text: i18next.t('采购APP') },
    { value: 2, text: i18next.t('业务平台') },
    { value: 3, text: i18next.t('供应商APP') },
  ]

  @observable filter = {
    ...initFilter,
  }

  @observable list = []

  @observable logLength = 0

  @action.bound
  async fetchLogList(paramsFromManagePaginationV2 = {}) {
    const {
      begin_time,
      end_time,
      search_text,
      categoryFilter,
      settle_supplier,
      source,
    } = this.filter

    if (moment(begin_time).add(31, 'd').isBefore(end_time)) {
      Tip.warning(i18next.t('时间范围不能超过31天'))
      return Promise.reject(i18next.t('时间范围不能超过31天'))
    }

    const { category1_ids, category2_ids, pinlei_ids } = categoryFilter
    const settle_supplier_id = settle_supplier && settle_supplier.id

    const req = {
      begin_time: moment(begin_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      search_text: search_text.trim() || null,
      category1_ids: category1_ids.length
        ? JSON.stringify(category1_ids.map((d) => d.id))
        : null,
      category2_ids: category2_ids.length
        ? JSON.stringify(category2_ids.map((d) => d.id))
        : null,
      pinlei_ids: pinlei_ids.length
        ? JSON.stringify(pinlei_ids.map((d) => d.id))
        : null,
      settle_supplier_id,
      count: 1,
      ...paramsFromManagePaginationV2,
    }

    source && (req.source = source)

    const json = await Request('/purchase/quote_price/search').data(req).get()
    const list = _.sortBy(json.data, (v) => !v.create_time)
    runInAction(() => {
      this.list = list
      this.logLength = json.pagination.count
    })

    return json
  }

  @action
  setFilterTime(begin_time, end_time) {
    this.filter.begin_time = begin_time
    this.filter.end_time = end_time
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  filterReset() {
    this.filter = {
      ...initFilter,
    }
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }
}

export default new Store()
