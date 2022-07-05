import { observable, action } from 'mobx'
import moment from 'moment'
import { formatTimeList } from 'common/dashboard/constants'
import { t } from 'gm-i18n'
import {
  requestTotalSaleData,
  requestCustomerPriceOrOrderPrice,
  requestTableList,
} from './service'
import { Storage } from '@gmfe/react'
import { COUNT_LIST_ENUM } from '../constants'
class Store {
  // ------ global -----

  @observable
  filter = {
    begin_time: moment().subtract(6, 'days'),
    end_time: moment(),
    type: Storage.get('summary') || 'order_time',
    searchText: '',
    merchantId: '',
  }
  // 用来导出保存的时候记录选择哪个

  @observable
  sortField = 'order_time'

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

  @action
  handleSearch = (filter = {}) => {
    this.filter = { ...this.filter, ...filter }
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

    return common
  }

  // -----  销售数据 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  saleData = {}

  @action
  fetchSaleData() {
    requestTotalSaleData(this.getParams()).then((data) => {
      this.saleData = data
    })
  }

  // -----  销售趋势 ------
  @observable
  customerPriceOrOrderPrice = []

  @action
  fetchCustomerPriceOrOrderPrice = (type) => {
    requestCustomerPriceOrOrderPrice(this.getParams(), type).then((data) => {
      const { begin_time, end_time } = this.filter
      this.customerPriceOrOrderPrice = formatTimeList(
        begin_time,
        end_time,
        data,
      ).map((item) => ({
        ...item,
        name: type === 'customerPrice' ? t('客单价') : t('笔单价'),
      }))
    })
  }

  // -----  表格 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  tableList = []

  @action
  fetchTableList = (pagination) => {
    const query = this.getParams()
    query.query_expr.reverse = this.sortDirection === 'desc' ? 1 : 0

    return requestTableList(
      query,
      pagination,
      COUNT_LIST_ENUM[this.sortField],
    ).then((res) => {
      this.tableList = res.data || []
      return res
    })
  }
}

export default new Store()
