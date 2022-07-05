import { observable, action } from 'mobx'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Storage } from '@gmfe/react'
import { groupByApt } from 'common/dashboard/sale/adaptor'
import {
  requestSaleDataFromMerchantDetail,
  requestSaleTrendFromMerchantDetail,
  requestOrderPriceAvgFromMerchantDetail,
  requestProductRank,
  requestSortData,
  requestTableList,
} from '../service'
import { formatTimeList, formarPieChartData } from 'common/dashboard/constants'
import { COUNT_LIST_ENUM } from '../../constants'

class Store {
  // ------ global -----

  @observable
  filter = {
    begin_time: moment().subtract(6, 'days'),
    end_time: moment(),
    type: Storage.get('merchant_analysis') || 'order_time',
    searchText: '',
    id: '', // 商户id
  }

  @action
  setFilter(filter) {
    for (const key in filter) {
      this.filter[key] = filter[key]
    }
  }

  // 搜索和导出的排序数据直接在仓库给默认值
  @observable
  sortField = 'order_time'

  @observable
  sortDirection = 'asc'

  // 用来改变保存的时候记录选择哪个
  @action
  changeExportFiled(sortField, sortDirection) {
    this.sortField = sortField
    this.sortDirection = sortDirection
  }

  // 更换地址触发 组件useEffect的渲染
  @action
  onSearch = (filter = {}) => {
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
    if (this.filter.id) {
      common.query_expr.filter.push({
        query_type: 0,
        query_argument: this.filter.id,
      })
    }

    return common
  }

  // -----  销售数据 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  saleData = {}

  @action
  fetchSaleData() {
    requestSaleDataFromMerchantDetail(this.getParams(), this.filter.id).then(
      (data) => {
        this.saleData = data
      },
    )
  }

  // -----  购买商品排行 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  productRank = []

  @action
  fetchProductRank = () => {
    return requestProductRank(this.getParams()).then((data) => {
      const res = groupByApt(
        data,
        {
          text: '购买商品排行',
          field: 'hotCategory',
          yAxis: 'account_price',
          xAxis: 'sku_name',
          type: '销售额',
        },
        1,
      )
      const list = res.data.map((item) => ({
        ...item,
        value: item.yAxis,
        type: t('销售额'),
      }))
      this.productRank = list
    })
  }

  // -----  购买分类分布 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  sortData = []

  @action
  fetchSortData = (type) => {
    return requestSortData(this.getParams(), type).then((data) => {
      const res = groupByApt(
        data,
        {
          text: '购买分布分类',
          field: 'hotCategory',
          yAxis: 'account_price',
          xAxis: type === 1 ? 'category_id_1' : 'category_id_2',
        },
        type,
      )

      this.sortData = formarPieChartData(res.data)
    })
  }

  // -----  客户购买量 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  trendData = {}

  @action
  fetchSaleTrend = (type) => {
    return requestSaleTrendFromMerchantDetail(this.getParams())
  }

  // -----  客户笔单价 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  orderPriceAvg = []

  @action
  fetchOrderPriceAvg = () => {
    return requestOrderPriceAvgFromMerchantDetail(this.getParams()).then(
      (data) => {
        const { begin_time, end_time } = this.filter
        this.orderPriceAvg = formatTimeList(begin_time, end_time, data).map(
          (item) => ({
            ...item,
            name: t('客户笔单价'),
          }),
        )
      },
    )
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
