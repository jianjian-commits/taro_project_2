import { observable, action, runInAction } from 'mobx'
import {
  saleTimeGet,
  saleListGet,
  merchandiseSaleListGet,
  saleListUpdate,
  skuImport,
  smartPriceListGet,
  deleteSaleMenu,
  fetchDefaultSaleMenu,
  fetchSalemenuShareId,
  fetchSalemenuShareInfo,
  setSaleListFormula,
  saleBatchDeleteSku,
} from './api'

import _ from 'lodash'
import { urlToParams } from '../../common/util'
import { getOverSuggestPrice, pennyToYuan } from '../util'
import { getBatchFilter, getQueryFilter } from './util'
import Big from 'big.js'
import globalStore from '../../stores/global'

class MerchandiseSaleStore {
  // 默认报价单相关信息 删除时展示
  @observable defaultSaleMenu = {
    default_salemenu_id: '',
    default_salemenu_name: '',
    station_id: '',
    station_name: '',
  }

  @observable time = []

  @observable card_filter = {
    time_config_id: '',
    type: '',
    is_active: '',
    q: '',
  }

  @observable cards = {
    list: [],
    loading: true,
  }

  @observable serviceTime = []

  @observable saleListFilter = {
    categoryFilter: {
      category1_ids: [],
      category2_ids: [],
      pinlei_ids: [],
    },
    state: '',
    text: '',
    formula: -1,
    sort_direction: null,
    sort_by: null,
  }

  @observable saleList = {
    loading: true,
    list: [],
    selectAll: false,
    selected: [],
    selectAllType: 1, // 1 当前页 2 所有页
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
  }

  @observable smartPriceFilter = {
    // 不止限于以下几项
    price_type: 0,
    cal_type: 0,
    cal_num: 0,
  }

  @observable smartPriceData = []

  @observable smartPricePagination = { count: 0, offset: 0, limit: 20 }

  @observable salemenuInfo = {
    salemenu_id: '',
    sku_data: [],
    logo: '',
    phone: '',
    sms_signature: '',
    address_url: '',
  }

  @action
  getSaleTime() {
    saleTimeGet().then((json) => {
      this.serviceTime = json.data || []
    })
  }

  @action
  getSaleCards() {
    this.cards.loading = true

    saleListGet(this.card_filter).then((json) => {
      this.cards = {
        list: json.data || [],
        loading: false,
      }
    })
  }

  @action
  changeFilter(name, value) {
    this.card_filter[name] = value
  }

  @action
  saleListSort(name, direction) {
    return Promise.resolve(
      (this.saleListFilter = Object.assign({}, this.saleListFilter, {
        sort_by: name,
        sort_direction: direction,
      }))
    )
  }

  @action
  clearMerchandiseSaleList() {
    this.saleList = {
      loading: true,
      list: [],
      selectAll: false,
      selected: [],
      selectAllType: 1,
      pagination: {
        count: 0,
        offset: 0,
        limit: 10,
      },
    }
  }

  @action
  getMerchandiseSaleList(salemenuId, pagination = {}) {
    this.saleList.loading = true

    const { sort_direction, sort_by } = this.saleListFilter
    let data = getQueryFilter(this.saleListFilter, salemenuId)
    data = Object.assign({}, data, {
      offset: pagination.offset,
      limit: pagination.limit,
    })

    if (sort_by && sort_direction) {
      data = Object.assign({}, data, {
        sort_by,
        sort_direction,
      })
    }

    merchandiseSaleListGet(data).then((json) => {
      this.saleList = {
        loading: false,
        list:
          _.map(json.data, (v, i) => {
            if (v.formula_info)
              v.formula_info.cal_num = Big(v.formula_info.cal_num)
                .div(100)
                .toFixed(v.formula_info.cal_type === 1 ? 3 : 2)

            return { ...v, _skuId: i }
          }) || [],
        pagination: json.pagination,
        selected: [],
        selectAll: false,
        selectAllType: 1,
      }
    })
  }

  @action
  saleCategoryFilterChange(name, v) {
    this.saleListFilter[name] = v
  }

  @action
  merchandiseSaleListExport(id) {
    const data = { export: 1, ...getQueryFilter(this.saleListFilter, id) }
    window.open(`/product/sku_salemenu/list?${urlToParams(data)}`)
  }

  @action
  updateMerchandiseSaleList(sku_id, field, value) {
    const data = { id: sku_id }

    if (field === 'sku_name') {
      data.name = value
    } else {
      data[field] = value
    }

    return saleListUpdate(data).then(() => {
      const list = [...this.saleList.list]
      _.forEach(list, (v) => {
        if (v.sku_id === sku_id) {
          v[field] = value
          // 联动修改其他数据
          if (field === 'std_sale_price_forsale') {
            if (globalStore.otherInfo.showSuggestPrice) {
              // 如果修改了销售单价，且开了建议定价区间，则判断所改价格是否在建议定价区间内
              v.over_suggest_price = getOverSuggestPrice(
                value,
                v.suggest_price_min,
                v.suggest_price_max
              )
            }
            v['sale_price'] = Math.round(value * v.sale_ratio)
          } else if (field === 'sale_price') {
            const price = Math.round(value / v.sale_ratio)
            if (globalStore.otherInfo.showSuggestPrice) {
              // 如果修改了销售价，且开了建议定价区间，则判断所对应的销售单价是否在建议定价区间内
              v.over_suggest_price = getOverSuggestPrice(
                price,
                v.suggest_price_min,
                v.suggest_price_max
              )
            }

            v['std_sale_price_forsale'] = price
          }
        }
      })
      this.saleList = Object.assign({}, this.saleList, { list: list })
    })
  }

  @action
  importSku(fileInfo, stationId, salemenuId) {
    return skuImport(fileInfo, stationId, salemenuId)
  }

  // sheetSelect
  @action
  merchandiseSaleListSelectAll() {
    let { selectAll, selected } = this.saleList
    if (selectAll) {
      selectAll = false
      selected = []
    } else {
      selectAll = true
      selected = _.map(this.saleList.list, (v) => v._skuId)
    }

    this.saleList = Object.assign({}, this.saleList, {
      selectAll,
      selected,
    })
  }

  @action
  merchandiseSaleListSelect(selected) {
    let { selectAll, selectAllType } = this.saleList
    if (selectAll && selected.length !== this.saleList.list.length) {
      selectAll = false
    } else if (selected.length === this.saleList.list.length) {
      selectAll = true
      selectAllType = 1
    }

    this.saleList = Object.assign({}, this.saleList, {
      selectAll,
      selected,
      selectAllType,
    })
  }

  @action
  editSmartPriceNext(salemenu_id, info) {
    const { price_region_min, price_region_max, cal_num, formula_type } = info

    let data = getBatchFilter(this.saleListFilter, this.saleList, salemenu_id)

    if (formula_type === 1) {
      data = Object.assign({}, data, { formula_type })
    } else if (formula_type === 2) {
      data = Object.assign({}, data, {
        ...info,
        price_region_min: pennyToYuan(price_region_min),
        price_region_max: pennyToYuan(price_region_max),
        cal_num: pennyToYuan(cal_num),
      })
    }

    return smartPriceListGet(data).then((json) => {
      // 记录请求信息和返回的sku_list 二次确认页面需要
      this.smartPriceFilter = data
      this.smartPriceData = json.data
      this.smartPricePagination = json.pagination

      return json
    })
  }

  @action
  deleteSaleMenu(id) {
    return deleteSaleMenu({ id })
  }

  @action
  getDefaultSaleMenu() {
    fetchDefaultSaleMenu().then((json) => {
      runInAction(() => {
        this.defaultSaleMenu = json.data
      })
    })
  }

  getSalemenuShareId(salemenu_id) {
    return fetchSalemenuShareId({ salemenu_id }).then((json) => {
      return json.data
    })
  }

  @action
  getSalemenuShareInfo(salemenu_id) {
    return fetchSalemenuShareInfo({ salemenu_id }).then((json) => {
      this.salemenuInfo = json.data
      return json.data
    })
  }

  // info 定价公式详情 sku_id 单个sku_id
  @action
  setFormula(salemenu_id, info, sku_id) {
    let data = getBatchFilter(
      this.saleListFilter,
      this.saleList,
      salemenu_id,
      sku_id
    )
    data = Object.assign({}, data, {
      ...info,
      price_region_min: pennyToYuan(info.price_region_min),
      price_region_max: pennyToYuan(info.price_region_max),
      cal_num: pennyToYuan(info.cal_num),
    })

    return setSaleListFormula(data)
  }

  @action
  changeSelectAllType() {
    const { selectAllType } = this.saleList
    this.saleList.selectAllType = selectAllType === 1 ? 2 : 1
  }

  // 批量删除sku
  // 报价单和商品库的批量删除sku，后台共用一个接口，search_from区分： 1-报价单 2-商品库
  @action
  batchDeleteSku(salemenu_id) {
    const data = getBatchFilter(this.saleListFilter, this.saleList, salemenu_id)
    data.search_from = 1

    return saleBatchDeleteSku(data)
  }
}

export default new MerchandiseSaleStore()
