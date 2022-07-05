import { observable, action } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { purchaseTaskHistorySearchDateTypes } from '../../../common/enum'

const date = moment().add(-4, 'month').endOf('month').startOf('day')

const initHeaderFilter = {
  search_text: '',
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  supplier: null,
  dateType: purchaseTaskHistorySearchDateTypes.ORDER.type,
  begin: date,
  end: date,
}

const initPagination = {
  limit: 10,
  page_obj: null,
  offset: 0,
}

const initCurrentPage = {
  page_obj: null,
  reverse: null,
}

class PurchaseTaskHistoryStore {
  @observable headerFilter = initHeaderFilter
  @observable taskListLoading = false
  @observable taskList = [] // 表格使用的list
  @observable taskListPagination = initPagination
  @observable currentPage = initCurrentPage

  @action
  init() {
    this.headerFilter = initHeaderFilter
    this.taskList = []
    this.taskListPagination = initPagination
  }

  @action
  resetPagination() {
    this.taskListPagination = {
      ...this.taskListPagination,
      limit: 10,
      page_obj: null,
      offset: 0,
    }
  }

  @action
  updateHeaderFilter(newData = {}) {
    if (
      newData.dateType ||
      (newData.time_config_id &&
        newData.time_config_id !== this.headerFilter.time_config_id)
    ) {
      newData.begin = date
      newData.end = date
    }

    this.headerFilter = {
      ...this.headerFilter,
      supplier: null, // 清空之前的状态
      ...newData,
    }
  }

  @action
  updateSearchDate({ begin, end }) {
    this.headerFilter = {
      ...this.headerFilter,
      supplier: null, // 清空之前的状态
      begin,
      end,
    }
  }

  @action
  fetchPurchaseTaskHistoryData(page) {
    this.taskListLoading = true
    const options = this.getSearchOptions(page)
    return Request('/purchase/task/early')
      .data(options)
      .get()
      .then(
        action((json) => {
          const list = this.addQuotePrice(json.data)
          this.taskList = list
          this.taskListPagination = {
            ...this.taskListPagination,
            ...json.pagination,
            offset: page.offset || 0,
          }
          this.currentPage = {
            page_obj: options.page_obj || null,
            reverse: options.reverse,
          }
          this.taskListLoading = false
          return json.data
        }),
      )
      .catch(
        action((e) => {
          this.taskListLoading = false
        }),
      )
  }

  getSearchOptions(page = { limit: 10 }) {
    const {
      categoryFilter,
      supplier,
      search_text,
      begin,
      end,
      dateType,
    } = this.headerFilter

    const category1_ids = _.map(categoryFilter.category1_ids, (cate) => cate.id)
    const category2_ids = _.map(categoryFilter.category2_ids, (cate) => cate.id)
    const pinlei_ids = _.map(categoryFilter.pinlei_ids, (cate) => cate.id)

    const query = {
      q_type: Number(dateType),
      q: search_text && search_text.trim(),
      category1_ids: category1_ids.length
        ? JSON.stringify(category1_ids)
        : null,
      category2_ids: category2_ids.length
        ? JSON.stringify(category2_ids)
        : null,
      pinlei_ids: pinlei_ids.length ? JSON.stringify(pinlei_ids) : null,
      settle_supplier_id: supplier && supplier.id,
      begin_time: moment(begin).format('YYYY-MM-DD HH:mm:ss'),
      end_time: moment(end).format('YYYY-MM-DD HH:mm:ss'),
      is_new_ui: 1,
    }

    return {
      ...query,
      ...page,
    }
  }

  addQuotePrice(list) {
    return _.map(list, (item) => {
      return {
        ...item,
        ...{
          last_in_stock_price: item.last_in_stock_price.newest.price,
          last_purchase_price: item.last_purchase_price.newest.price,
          last_quote_price: item.last_quote_price.newest.price,
          last_in_stock_price_newest: item.last_in_stock_price.newest,
          last_purchase_price_newest: item.last_purchase_price.newest,
          last_quote_price_newest: item.last_quote_price.newest,
          last_in_stock_price_earlier: item.last_in_stock_price.earlier || [],
          last_purchase_price_earlier: item.last_purchase_price.earlier || [],
          last_quote_price_earlier: item.last_quote_price.earlier || [],
        },
      }
    })
  }
}

export default new PurchaseTaskHistoryStore()
