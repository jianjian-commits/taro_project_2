import { observable, action } from 'mobx'
import { t } from 'gm-i18n'
import moment from 'moment'
import {
  requestSaleDataFromMerchant,
  requestRankDataFromMerchant,
  requestOrderDataFromMerchant,
} from '../service'
import { Storage } from '@gmfe/react'
import { formatTimeList } from 'common/dashboard/constants'
import _ from 'lodash'

class Store {
  // ------ global -----

  @observable
  filter = {
    begin_time: moment().subtract(6, 'days'),
    end_time: moment(),
    type: Storage.get('merchant_analysis') || 'order_time',
    searchType: 0, // 默认商户
    searchText: '',
  }

  // 用来导出保存的时候记录选择哪个
  @observable
  sortField = 'shop_id'

  @observable // 默认的时候根据表格来判断
  sortDirection = 'asc' // 这个是排序的问题

  // 用来改变保存的时候记录选择哪个
  @action
  changeExportFiled(sortField, sortDirection) {
    this.sortField = sortField
    this.sortDirection = sortDirection
  }

  @observable doFirstRequest = _.noop()

  @action
  setDoFirstRequest(func) {
    this.doFirstRequest = func
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
        query_type: this.filter.searchType,
        query_argument: this.filter.searchText,
      })
    } else {
      // 没有输入值的情况和后端约定: filter 传 []
      common.query_expr.filter = []
    }

    return common
  }

  @action
  changeFilter = (filter) => {
    for (const key in filter) {
      this.filter[key] = filter[key]
    }
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
  fetchSaleData() {
    return requestSaleDataFromMerchant(this.getParams()).then((data) => {
      this.saleData = data
    })
  }

  // -----  客户排名 ------
  @observable
  rankSale = []

  @action
  fetchRankSale() {
    return requestRankDataFromMerchant(this.getParams()).then((data) => {
      this.rankSale = data.map((item) => ({
        value: Number(item.yAxis),
        xAxis: item.shop_name,
        type: t('客户排行'),
      }))
    })
  }

  // ---- 下单客户 ----
  @observable
  orderData = []

  @action
  fetchOrderData() {
    return requestOrderDataFromMerchant(this.getParams()).then((data) => {
      const { begin_time, end_time } = this.filter
      this.orderData = formatTimeList(begin_time, end_time, data).map(
        (item) => ({
          ...item,
          name: t('下单客户'),
        }),
      )
    })
  }
}

export default new Store()
