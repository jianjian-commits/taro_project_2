import moment from 'moment'
import _ from 'lodash'
import { t } from 'gm-i18n'

import { action, computed, observable } from 'mobx'
import {
  createStockIn,
  getStockIn,
  processOrderDetailsGet,
  searchSkus,
  semiProductListGet,
  shelfListGet,
  editStockIn,
  deleteSkuIn,
  skucategoriesGet,
  getRecvers,
} from '../../../api'
import { urlToParams, adapterMoreSelectComData } from 'common/util'

const now = new Date()
const default_filter = {
  begin: moment(now).format('YYYY-MM-DD'),
  end: moment(now).format('YYYY-MM-DD'),
  level1: 0,
  level2: 0,
  status: 0,
  search_text: '',
  recver_id: -1, // 领料人id
}

const DEFAULT_STOCK_IN_PARAMS = {
  ratio: null,
  std_unit_name: '',
  sale_unit_name: '',
  status: null,
  batch_num: '', // 兼容旧的创建 api
  batch_number: '',
  sku_name: '',
  process_order: '',
  amount: null,
  reference_cost: null,
  price: null,
  unit_process_cost: null, // 单位加工成本
}

class StockInList {
  constructor() {
    this.doFirstRequest = _.noop()
  }

  // 原料
  @observable product_filter = default_filter
  @observable product_list = []

  // 半成品
  @observable semi_filter = default_filter
  @observable semi_list = []

  @observable skuCategories = []

  @observable locationList = []

  // 入库
  @observable stockInParams = {
    ...DEFAULT_STOCK_IN_PARAMS,
  }

  // 加工单列表
  @observable orderList = []

  @observable skuData = []

  // 领料人列表
  @observable recverList = []

  @action init() {
    this.stockInParams = { ...DEFAULT_STOCK_IN_PARAMS }
  }

  @action
  getRecverList() {
    return getRecvers().then((json) => {
      const data = _.map(json.data.users, (v) => {
        // type_id 1 为供应商
        if (v.type_id !== 1) {
          return {
            ...v,
            value: v.id,
            text: _.trim(v.name) || v.username,
          }
        } else {
          return null
        }
      }).filter((_) => _)
      this.recverList = _.concat([{ value: -1, text: t('全部领料人') }], data)
    })
  }

  @action
  removeSkuIn(e) {
    return deleteSkuIn({ batch_number: e })
  }

  @action
  getSkucategories() {
    skucategoriesGet().then((json) => {
      this.skuCategories = json.data
    })
  }

  @action
  changeFilter(type, filter) {
    if (type === 'semi') {
      this.semi_filter = filter
    } else {
      this.product_filter = filter
    }
  }

  @action
  getSemiFilter() {
    const { begin, end, level1, level2, search_text } = this.semi_filter
    let postData = {
      begin,
      end,
      type: 2,
    }
    if (level1 !== 0)
      postData = Object.assign({}, postData, { category1_id: level1 })
    if (level2 !== 0)
      postData = Object.assign({}, postData, { category2_id: level2 })
    if (_.trim(search_text) !== '')
      postData = Object.assign({}, postData, { q: search_text })

    return postData
  }

  @action.bound
  getSemiList(pagination = {}) {
    const postData = Object.assign({}, this.getSemiFilter(), pagination)

    return semiProductListGet(postData).then(
      action('getList', (data) => {
        this.semi_list = data.list
        return data
      }),
    )
  }

  @action
  getProductFilter() {
    const {
      begin,
      end,
      level1,
      level2,
      search_text,
      status,
      recver_id,
    } = this.product_filter
    let postData = {
      begin,
      end,
      type: 3,
    }
    if (level1 !== 0)
      postData = Object.assign({}, postData, { category1_id: level1 })
    if (level2 !== 0)
      postData = Object.assign({}, postData, { category2_id: level2 })
    if (status !== 0) postData = Object.assign({}, postData, { status })
    if (_.trim(search_text) !== '')
      postData = Object.assign({}, postData, { q: search_text })
    if (+recver_id !== -1) {
      postData = Object.assign({}, postData, { recver_id })
    }

    return postData
  }

  @action.bound
  getProductList(pagination = {}) {
    const postData = Object.assign({}, this.getProductFilter(), pagination)

    return semiProductListGet(postData).then(
      action('getList', (data) => {
        this.product_list = data.list
        return data
      }),
    )
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有paginationBox提供
    this.doFirstRequest = func
  }

  @action
  exportSemiProduct(type, filter) {
    const {
      begin,
      end,
      level1,
      level2,
      search_text,
      status,
      recver_id,
    } = filter
    let exportParams = {
      begin,
      end,
      type: type === 'semi' ? 2 : 3,
      q: search_text,
    }
    exportParams = Object.assign(
      {},
      exportParams,
      status !== 0 ? { status } : {},
      level1 !== 0 ? { category1_id: filter.level1 } : {},
      level2 !== 0 ? { category2_id: filter.level2 } : {},
      +recver_id !== -1 && { recver_id },
    )
    const url = urlToParams(exportParams)
    window.open(
      `/stock/in_stock_sheet/semi_product/list?export=1&type=2&status&` + url,
    )
  }

  @action
  getProcessOrderDetail(q) {
    return processOrderDetailsGet(q).then((json) => {
      this.orderList = adapterMoreSelectComData(json.data, 'id', 'id')
      return json
    })
  }

  @action
  setStockInParam = (obj) => {
    this.stockInParams = obj
  }

  @action
  getProductStockIn = (obj) => {
    getStockIn(obj).then((json) => {
      this.setStockInParam(json.data)
    })
  }

  @action
  getShelfList = () => {
    return shelfListGet().then((json) => json)
  }

  @action
  createProductStockIn = () => {
    return createStockIn(this.stockInParams)
  }

  @action
  editProductStockIn = () => {
    return editStockIn(this.stockInParams)
  }

  @action
  searchSkuList = (q) => {
    return searchSkus({ q }).then((json) => {
      this.skuData = json.data
    })
  }

  @computed
  get formatSkusData() {
    return _.map(this.skuData, (item) => {
      return {
        label: `${item.category_name_1}/${item.category_name_2}/${item.spu_name}`,
        children: _.map(item.skus, (o) => {
          return {
            ...o,
            value: o.id,
            text: `${o.name}(${o.id})`,
          }
        }),
      }
    })
  }
}

export default new StockInList()
