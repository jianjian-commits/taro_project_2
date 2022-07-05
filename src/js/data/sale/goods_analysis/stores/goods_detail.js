import { observable, action } from 'mobx'
import moment from 'moment'
import { t } from 'gm-i18n'
import {
  requestDetailSaleData,
  requestDetailSaleDataTrend,
  requestDetailShopRank,
  requestGoodsTableList,
  fetchDetailPriceTrendStock,
} from '../service'
import { Storage } from '@gmfe/react'
import { formatAllOrderDetail } from 'common/dashboard/sale/adaptor'
import { formatTimeList } from 'common/dashboard/constants'
import { PRODUCT_LIST_ENUM } from '../../constants'
import { Request } from '@gm-common/request'
class Store {
  // ------ global -----

  @observable
  filter = {
    begin_time: moment().subtract(6, 'days'),
    end_time: moment(),
    type: Storage.get('shop_goods_analysis') || 'order_time',
    searchText: '', // 商品id
    merchantId: '',
    salemenu_id: '', // 报价单id
  }
  // 用来导出保存的时候记录选择哪个

  @observable
  sortField = 'order_time'

  @observable // 默认的时候根据表格来判断
  sortDirection = 'asc' // 这个是排序的问题

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

  // 明细表获取到所有的商品 但是要根据传过来的id
  @action
  getShopList = () => {
    return Request('/product/sku_salemenu/list')
      .data({
        category1_ids: JSON.stringify([]),
        category2_ids: JSON.stringify([]),
        pinlei_ids: JSON.stringify([]),
        text: '',
        salemenu_id: this.filter.salemenu_id, // 报价单id
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
        filter: [],
        group_by_fields: [],
        order_by_fields: [],
      },
    }
    if (this.filter.searchText) {
      common.query_expr.filter.push({
        query_type: 5,
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
  @observable
  saleData = []

  @action
  fetchDetailSaleData = (group_by_fields) => {
    requestDetailSaleData(this.getParams(), [group_by_fields]).then((res) => {
      this.saleData = formatAllOrderDetail(res.data)
    })
  }

  // --- 下单商户数趋势 -----
  @action
  fetchDetailPriceTrend = () => {
    const params = {
      sku_ids: JSON.stringify([this.filter.searchText]),
      start_time: moment(this.filter.begin_time).format('YYYY-MM-DD hh:mm:ss'),
      end_time: moment(this.filter.end_time).format('YYYY-MM-DD hh:mm:ss'),
      is_filter: 1,
    }
    return Request('/product/sku_snapshot/detail').data(params).get() // 下单商户数趋势
  }

  // --- 商品出库单价接口
  @action
  fetchDetailPriceTrendStock = () => {
    return fetchDetailPriceTrendStock(this.getParams())
  }

  // -----  商品销售额趋势 ------
  @observable
  saleDataTrend = []

  fetchDetailSaleDataTrend = (type) => {
    requestDetailSaleDataTrend(this.getParams(), type).then((data) => {
      const { begin_time, end_time } = this.filter
      if (!data || data.length === 0) return (this.saleDataTrend = [])
      this.saleDataTrend = formatTimeList(begin_time, end_time, data).map(
        (item) => ({
          ...item,
          name: t('商品销售额趋势'),
        }),
      )
    })
  }

  // -----  销售数据趋势 ------
  @observable
  shopRank = []

  @action
  fetchDetailShopRank = (type) => {
    requestDetailShopRank(this.getParams(), type).then((data) => {
      this.shopRank = data.map((item) => ({
        ...item,
        type: t('销售额'),
      }))
    })
  }

  // ---- 明细表
  @action
  fetchSaleTableList = (pagination = {}) => {
    const query = this.getParams()
    query.query_expr.reverse = this.sortDirection === 'desc' ? 1 : 0
    return requestGoodsTableList(
      query,
      pagination,
      PRODUCT_LIST_ENUM[this.sortField],
    )
  }
}

export default new Store()
