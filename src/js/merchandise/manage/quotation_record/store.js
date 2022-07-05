import { observable, action, computed } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { Storage } from '@gmfe/react'
import { Request } from '@gm-common/request'

import { System } from 'common/service'
import { urlToParams } from 'common/util'
import { transformPriceDateList, transformSelected } from './utils'
import globalStore from 'stores/global'

const MERCHANDISE_ROOT_KEY =
  'list_sort_type_quotation_merchandise_manage_sale_list'
const QUOTATION_ROOT_KEY =
  'list_sort_type_quotation_merchandise_manage_sale_list'
const merchandiseSortItem = Storage.get(MERCHANDISE_ROOT_KEY)
const quotationSortItem = Storage.get(QUOTATION_ROOT_KEY)

const getSkuPriceRequest = async (params) => {
  return Request('/product/sku_snapshot/prices').data(params).get()
}

const getSaleMenuRequest = async () => {
  return Request('/salemenu/sale/list')
    .data({
      is_deleted: 1,
    })
    .get()
}

const initMerchandiseFilter = {
  begin: moment().startOf('day').subtract(6, 'days'),
  end: moment().startOf('day'),
  text: '',
  categoryFilter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
  },
  salemenu: {},
}

const initQuotationFilter = {
  salemenu: {},
  end_time: moment().startOf('day'),
  selectedDateList: [],
}

const initDetailFilter = {
  sku_name: '',
  sku_id: '',
  start_time: moment().startOf('day').subtract(6, 'days'),
  end_time: moment().startOf('day'),
}

const initPagination = {
  offset: 0,
  limit: 10,
  count: 0,
}

const initMerchandise = {
  list: [],
  sort_direction: merchandiseSortItem
    ? merchandiseSortItem.sort_direction
    : null,
  sort_by: merchandiseSortItem ? merchandiseSortItem.sort_by : null,
  pagination: initPagination,
}

const initQuotation = {
  list: [],
  sort_direction: quotationSortItem ? quotationSortItem.sort_direction : null,
  sort_by: quotationSortItem ? quotationSortItem.sort_by : null,
  pagination: initPagination,
}

const initDetail = {
  start_time: moment().startOf('day').subtract(6, 'days'),
  end_time: moment().startOf('day'),
  list: [],
  fee_type: '',
  std_unit_name_forsale: '',
}

// 按商品查看
class MerchandiseStore {
  @observable doMerchandiseFirstRequest = _.noop()
  @observable merchandise_filter = initMerchandiseFilter
  @observable merchandise = initMerchandise

  // 初始化商品查看的过滤
  @action
  initMerchandiseFilter() {
    this.merchandise_filter = initMerchandiseFilter
  }

  // 初始化商品查看的列表数据
  @action
  initMerchandise() {
    this.merchandise = initMerchandise
  }

  @action
  setMerchandiseDoFirstRequest(func) {
    // doMerchandiseFirstRequest 有 ManagePagination 提供
    this.doMerchandiseFirstRequest = func
  }

  @action
  changeMerchandiseFilter(params) {
    this.merchandise_filter = Object.assign(this.merchandise_filter, params)
  }

  // 获取按商品查看的数据
  @action
  getMerchandiseList(page) {
    const { sort_by, sort_direction } = this.merchandise
    let params = Object.assign(this.merchandiseFilter, {
      offset: page.offset,
      limit: page.limit,
    })
    if (sort_by && sort_direction) {
      params = Object.assign({}, params, {
        sort_by,
        sort_direction,
      })
    }
    return Request('/product/sku_salemenu/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          const { pagination, data } = json
          this.merchandise.list = data
          const sku_ids = _.map(json.data, (v) => v.sku_id)
          this.merchandise.pagination = pagination
          getSkuPriceRequest({
            sku_ids: JSON.stringify(sku_ids),
            start_time: this.merchandiseFilter.start_time,
            end_time: this.merchandiseFilter.end_time,
          }).then(
            action((json) => {
              this.merchandise.list = _.map(data, (v) => {
                const priceDataIndex = _.findIndex(
                  json.data,
                  (o) => o.sku_id === v.sku_id,
                )
                return {
                  ...v,
                  ...json.data[priceDataIndex],
                }
              })
            }),
          )

          return json
        }),
      )
  }

  // 转换按商品查看的过滤
  @computed
  get merchandiseFilter() {
    const {
      begin,
      end,
      text,
      categoryFilter,
      salemenu,
    } = this.merchandise_filter
    const { category1_ids, category2_ids, pinlei_ids } = categoryFilter
    const filter = {
      text: text || null,
      start_time: begin && moment(begin).format('YYYY-MM-DD HH:mm:ss'),
      end_time: end && moment(end).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      category1_ids: JSON.stringify(_.map(category1_ids, (v) => v.id)),
      category2_ids: JSON.stringify(_.map(category2_ids, (v) => v.id)),
      pinlei_ids: JSON.stringify(_.map(pinlei_ids, (v) => v.id)),
      salemenu_id: salemenu.id,
    }

    return filter
  }

  // 按商品查看的排序
  @action
  sortMerchandise(name) {
    const { sort_direction, sort_by } = this.merchandise
    let direction = 'asc'
    this.merchandise.sort_by = name
    if (sort_by === name && sort_direction === 'desc') {
      direction = ''
    } else if (!sort_direction) {
      direction = 'asc'
    } else {
      direction = 'desc'
    }

    this.merchandise.sort_direction = direction
    Storage.set(MERCHANDISE_ROOT_KEY, {
      sort_by: name,
      sort_direction: direction,
    })
  }
}

// 按报价单查看
class QuotationStore {
  @observable doQuotationFirstRequest = _.noop()
  @observable quotation_filter = initQuotationFilter
  @observable quotation = initQuotation

  // 初始化报价单查看的过滤
  @action
  initQuotationFilter() {
    this.quotation_filter = initQuotationFilter
  }

  // 初始化报价单查看的列表数据
  @action
  initQuotation() {
    this.quotation = initQuotation
  }

  @action
  changeQuotationFilter(params) {
    this.quotation_filter = Object.assign(this.quotation_filter, params)
  }

  @action
  setQuotationDoFirstRequest(func) {
    // doQuotationFirstRequest 有 ManagePagination 提供
    this.doQuotationFirstRequest = func
  }

  // 获取按报价单查看的数据
  @action
  getQuotationList(page) {
    const { sort_by, sort_direction } = this.quotation
    let params = Object.assign(this.quotationFilter, {
      offset: page.offset,
      limit: page.limit,
    })
    if (sort_by && sort_direction) {
      params = Object.assign({}, params, {
        sort_by,
        sort_direction,
      })
    }
    return Request('/product/sku_salemenu/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          const { pagination, data } = json
          this.quotation.pagination = pagination
          this.quotation.list = data

          const sku_ids = _.map(data, (v) => v.sku_id)

          getSkuPriceRequest({
            sku_ids: JSON.stringify(sku_ids),
            start_time: this.quotationFilter.start_time,
            end_time: this.quotationFilter.end_time,
          }).then(
            action((json) => {
              this.quotation.list = _.map(data, (v) => {
                const priceDataIndex = _.findIndex(
                  json.data,
                  (o) => o.sku_id === v.sku_id,
                )
                return {
                  ...v,
                  ...json.data[priceDataIndex],
                }
              })
            }),
          )

          return json
        }),
      )
  }

  // 转换按报价单查看的过滤
  @computed
  get quotationFilter() {
    const { end_time, salemenu } = this.quotation_filter
    const filter = {
      start_time: end_time && moment(end_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time:
        end_time &&
        moment(end_time).add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
      salemenu_id: salemenu.id,
    }

    return filter
  }

  // 只有选择了报价单，才能获取对应的数据
  @computed
  get canSearchQuotation() {
    const { end_time, salemenu } = this.quotation_filter
    if (!salemenu?.id) {
      return false
    }
    if (!end_time) {
      return false
    }
    return true
  }

  // 按报价单查看的排序
  @action
  sortQuotation(name) {
    const { sort_direction, sort_by } = this.quotation
    let direction = 'asc'
    this.quotation.sort_by = name
    if (sort_by === name && sort_direction === 'desc') {
      direction = ''
    } else if (!sort_direction) {
      direction = 'asc'
    } else {
      direction = 'desc'
    }

    this.quotation.sort_direction = direction
    Storage.set(QUOTATION_ROOT_KEY, {
      sort_by: name,
      sort_direction: direction,
    })
  }

  // 获取分享历史报价
  @action
  getShareInfo() {
    const { start_time, end_time, salemenu_id } = this.quotationFilter
    return Request('/station/salemenu/share/create')
      .data({ salemenu_id, start_time, end_time })
      .post()
  }

  // 获取历史周期数据
  @action
  getHistoryPriceDate() {
    const { salemenu_id } = this.quotationFilter
    return Request('/salemenu/sale_snapshot/list')
      .data({
        salemenu_id,
        is_filter: 1,
      })
      .get()
      .then(
        action((json) => {
          this.quotation_filter.selectedDateList = transformPriceDateList(
            json.data,
          )
          return json
        }),
      )
  }

  @action
  export() {
    const params = Object.assign(this.quotationFilter, { export: 1 })
    if (System.isC()) params.is_retail_interface = 1
    window.open(`/product/sku_salemenu/list?${urlToParams(params)}`)
  }
}

// 详情
class DetailStore {
  @observable detail_filter = initDetailFilter
  @observable detail = initDetail

  @action
  changeDetailFilter(params) {
    this.detail_filter = Object.assign(this.detail_filter, params)
  }

  @action
  changeDetail(params) {
    this.detail = Object.assign(this.detail, params)
  }

  @action
  initDetail() {
    this.detail = initDetail
  }

  @action
  initDetailFilter() {
    this.detail_filter = initDetailFilter
  }

  @action
  getDetailList() {
    const { sku_id, start_time, end_time } = this.detail_filter
    const params = {
      sku_ids: JSON.stringify([sku_id]),
      start_time: moment(start_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time: moment(end_time).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      is_filter: 1, // 按字段去重
    }

    return Request('/product/sku_snapshot/detail')
      .data(params)
      .get()
      .then(
        action((json) => {
          // 产品说要默认一个空item的样式
          const empty = {
            modify_time: moment(start_time).format('YYYY-MM-DD'),
            next_modify_time: moment(end_time).format('YYYY-MM-DD'),
          }
          // 单个商品，直接获取第一个
          this.detail.list = _.head(json.data)?.snapshot_list || [empty]
          this.detail.start_time = start_time
          this.detail.end_time = end_time

          // 获取单位
          this.detail.fee_type = _.head(this.detail.list)?.fee_type
          this.detail.std_unit_name_forsale = _.head(
            this.detail.list,
          )?.std_unit_name_forsale
          return json
        }),
      )
  }

  @action
  export() {
    const { sku_id, start_time, end_time } = this.detail_filter
    const params = {
      sku_ids: JSON.stringify([sku_id]),
      start_time: moment(start_time).format('YYYY-MM-DD HH:mm:ss'),
      end_time: moment(end_time).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      is_filter: 1, // 按字段去重
      is_export: 1, // 导出
    }

    window.open(`/product/sku_snapshot/detail?${urlToParams(params)}`)
  }

  // 图表数据
  @computed
  get summaryList() {
    const { start_time, end_time } = this.detail
    // 获取图表X轴坐标区间
    const diffDay = moment(end_time).diff(moment(start_time), 'days')

    // 包括第end时间，所以 diff + 1 天
    const res = _.map(new Array(diffDay + 1), (o, index) => {
      // 获取对应周期日期
      const date = moment(end_time).subtract(index, 'days')
      // 获取日期对应数据
      const filterDate = _.filter(this.detail.list, (item) => {
        const endDate = moment(item.next_modify_time)
        const startDate = moment(item.modify_time)
        // start <= date < end,在区间内则是这个价格
        if (date.isSame(startDate) || date.isSame(endDate)) {
          return true
        }
        if (date.isBefore(endDate) && date.isAfter(startDate)) {
          return true
        }
        return false
      })
      return {
        date: date.format('YYYY-MM-DD'),
        price: Big(_.last(filterDate)?.std_sale_price_forsale || 0)
          .div(100)
          .toFixed(2),
      }
    })
    return res
  }

  // 最高销售单价
  @computed
  get maxPrice() {
    const sortList = _.sortBy(this.summaryList, (v) => _.toNumber(v.price))
    return _.last(sortList)?.price || 0
  }

  // 最低销售单价
  @computed
  get minPrice() {
    const sortList = _.sortBy(this.summaryList, (v) => _.toNumber(v.price))
    return _.head(sortList)?.price || 0
  }

  // 销售单价周期均值
  @computed
  get averagePrice() {
    const sum = _.reduce(
      this.summaryList,
      (res, v) => res + _.toNumber(v.price),
      0,
    )

    // 图表无数据
    if (this.summaryList.length === 0) {
      return 0
    }

    return Big(sum).div(this.summaryList.length).toFixed(2)
  }
}

// 打印
class PrintStore {
  @observable sku_data = []
  @observable address_url = ''
  @observable logo = ''
  @observable phone = ''
  @observable sms_signature = ''
  @observable share_url = ''

  @action
  initPrintInfo() {
    this.sku_data = []
    this.address_url = ''
    this.logo = ''
    this.phone = ''
    this.sms_signature = ''
  }

  // 获取分享历史报价
  @action
  getShareInfo(params) {
    const { start_time, end_time, salemenu_id } = params
    return Request('/station/salemenu/share/create')
      .data({ salemenu_id, start_time, end_time })
      .post()
      .then(
        action((json) => {
          const url = `${window.location.origin}/more/?__trace_group_id=${globalStore.groupId}/#/salemenu?share_id=${json.data.id}`
          this.share_url = url
        }),
      )
  }

  // 打印历史报价
  @action
  getPrintInfo(params) {
    const { start_time, end_time, salemenu_id } = params
    return Request('/station/salemenu/print')
      .data({
        salemenu_id,
        start_time,
        end_time,
      })
      .get()
      .then(
        action((json) => {
          const {
            sku_data,
            address_url,
            logo,
            phone,
            sms_signature,
          } = json.data
          this.sku_data = sku_data
          this.address_url = address_url
          this.logo = logo
          this.phone = phone
          this.sms_signature = sms_signature
          return json
        }),
      )
  }
}

// 公共
class CommonStore {
  @observable salemenuList = []

  @action
  getSaleMenuList() {
    return getSaleMenuRequest().then(
      action((json) => {
        this.salemenuList = transformSelected(
          _.sortBy(json.data, (v) => -v.type),
        )
        return json
      }),
    )
  }
}

const merchandiseStore = new MerchandiseStore()
const quotationStore = new QuotationStore()
const detailStore = new DetailStore()
const printStore = new PrintStore()
const commonStore = new CommonStore()

export {
  merchandiseStore,
  quotationStore,
  detailStore,
  printStore,
  commonStore,
}
