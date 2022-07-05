import { observable, action } from 'mobx'
import moment from 'moment'
import { Storage } from '@gmfe/react'
import { requestOrderDetailHotCategory } from 'common/dashboard/sale/request'
import { requestSortTableList } from '../service'
import { formarPieChartData } from 'common/dashboard/constants'
import { PRODUCT_LIST_ENUM } from '../../constants'
// console.log('111111', Storage.get('category_goods_analysis'))
class Store {
  // ------ global -----
  @observable
  filter = {
    begin_time: moment().subtract(6, 'days'),
    end_time: moment(),
    type: Storage.get('category_goods_analysis') || 'order_time',
    searchText: '',
    merchantId: '',
  }

  @observable
  sortField = 'category_id_1_name'

  @observable // 默认的时候根据表格来判断
  sortDirection = 'asc' // 这个是排序的问题

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

  // 更换filter地址触发子组件重渲染
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

  // -----  热销分类 ------
  @observable
  hotCategory = []

  @action
  fetchHotCategory(group_by_fields = 1) {
    requestOrderDetailHotCategory(this.getParams(), [group_by_fields]).then(
      (data) => {
        this.hotCategory = formarPieChartData(data)
      },
    )
  }

  @action
  fetchTableList = (pagination = {}) => {
    const query = this.getParams()
    query.query_expr.reverse = this.sortDirection === 'desc' ? 1 : 0
    return requestSortTableList(
      query,
      pagination,
      PRODUCT_LIST_ENUM[this.sortField],
    )
  }
}

export default new Store()
