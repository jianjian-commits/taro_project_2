import { observable, action } from 'mobx'
import moment from 'moment'
import { t } from 'gm-i18n'
import {
  requestOrderDetailSaleData,
  requestOrderDetailRankSale,
  requestOrderDetailAfterSale,
  requestSaleableRank,
  requestUnsaleableRank,
  requestSaleTableList,
} from '../service'
import { Storage } from '@gmfe/react'
import { formatAllOrderDetail } from 'common/dashboard/sale/adaptor'
import { PRODUCT_LIST_ENUM } from '../../constants'
import { Request } from '@gm-common/request'

const ENUM_TYPE = {
  sale: t('销售额'),
  order: t('下单频次'),
}
class Store {
  // ------ global -----

  @observable
  filter = {
    begin_time: moment().subtract(6, 'days'),
    end_time: moment(),
    type: Storage.get('shop_goods_analysis') || 'order_time',
    searchText: '', // shopId
    searchType: 5,
    merchantId: '',
    salemenu_id: '', // 报价单id
  }

  // 报价单的list
  @observable
  quotationList = []

  // 获取报价单的列表
  @action
  getQuotationList = () => {
    return Request('/salemenu/sale/list?type=-1&with_sku_num=1&q=')
      .get()
      .then((res) => {
        this.quotationList = res.data.map((item) => ({
          value: item.id,
          text: item.name,
        }))
      })
  }

  // 商品List
  @observable
  shopList = []

  @action
  getShopList = () => {
    return Request('/product/sku_salemenu/list')
      .data({
        category1_ids: JSON.stringify([]),
        category2_ids: JSON.stringify([]),
        pinlei_ids: JSON.stringify([]),
        text: '',
        salemenu_id: this.filter.salemenu_id,
        offset: 0,
        limit: 999,
      })
      .get()
      .then((res) => {
        this.shopList = res.data.map((item) => ({
          value: item.sku_id,
          text: item.sku_name,
        }))
      })
  }

  // 用来导出保存的时候记录选择哪个
  @observable
  sortField = 'category_id_1_name'

  @observable // 默认的时候根据表格来判断
  sortDirection = 'asc' // 这个是排序的问题

  // 用来改变保存的时候记录选择哪个
  @action
  changeExportFiled(sortField, sortDirection) {
    this.sortField = sortField
    this.sortDirection = sortDirection
  }

  @action
  setFilter(filter) {
    for (const key in filter) {
      this.filter[key] = filter[key]
    }
  }

  getParams() {
    const common = {
      time_range: [
        {
          begin_time: this.filter.begin_time,
          end_time: this.filter.end_time,
          time_field: this.filter.type,
        },
      ],
      query_expr: {
        // filter: [{ query_type: 0, query_argument: this.merchantId }],
        filter: [],
        group_by_fields: [],
        order_by_fields: [],
      },
    }

    if (this.filter.searchText) {
      common.query_expr.filter.push({
        query_type: this.filter.searchType,
        query_argument: this.filter.searchText,
      })
    } else {
      // 没有输入值的情况和后端约定: filter 传 []
      common.query_expr.filter = []
    }

    return common
  }

  // 更换filter地址触发子组件重渲染
  @action
  handleSearch = (filter = {}) => {
    this.filter = { ...this.filter, ...filter }
  }

  // -----  销售数据 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  saleData = {}

  @action
  fetchSaleData() {
    requestOrderDetailSaleData(this.getParams()).then((res) => {
      this.saleData = formatAllOrderDetail(res)
    })
  }

  // -----  商品排名 ------
  @observable
  rankSale = []

  @action
  fetchRankSale(type) {
    requestOrderDetailRankSale(this.getParams(), type).then((data) => {
      this.rankSale = data.map((item) => ({
        ...item,
        yAxis: type === 'order' ? Number(item.yAxis) : item.yAxis, // 下单频次取整
        xAxis: item.sku_name + '(' + item.sku_id + ')',
        type: ENUM_TYPE[type],
      }))
    })
  }

  // -----  商品售后 ------
  @observable
  afterSale = []

  @action
  fetchAfterSale() {
    requestOrderDetailAfterSale(this.getParams()).then((data) => {
      this.afterSale = data.map((item) => ({
        ...item,
        yAxis: Number(item.yAxis), // 取整
        xAxis: item.sku_name + '(' + item.sku_id + ')', // 取整
        type: t('售后频次'),
      }))
    })
  }

  // --- 商品畅销排行 - 未使用
  fetchSaleableRank = () => {
    return requestSaleableRank(this.getParams())
  }

  // --- 商品滞销排行 - 未使用
  fetchUnsaleableRank = () => {
    return requestUnsaleableRank(this.getParams())
  }

  // ---- 明细表
  fetchSaleTableList = (pagination = {}) => {
    const query = this.getParams()
    query.query_expr.reverse = this.sortDirection === 'desc' ? 1 : 0
    return requestSaleTableList(
      query,
      pagination,
      PRODUCT_LIST_ENUM[this.sortField],
    )
  }
}

export default new Store()
