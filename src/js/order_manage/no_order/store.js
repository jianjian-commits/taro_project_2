import { action, observable } from 'mobx'
import { Request as _Request } from '@gm-common/request'
import { enhanceRequest } from 'common/dashboard/sale/enhance_request'
import moment from 'moment'
// 封装接口使用class自动拼装limit
const Request = enhanceRequest(_Request)

class Store {
  @observable filter = {
    begin: moment().startOf('date'),
    end: moment().endOf('date'),
    dataType: 'order_time',
  }

  @action
  setFilter = (filter = {}) => {
    this.filter = { ...this.filter, ...filter }
  }

  @action mergeFilter = (options) => {
    // debugger
    console.log(options)
    this.filter = Object.assign(this.filter, options)
  }

  @observable list = []
  @action setList = (value) => {
    this.list = value
  }

  @observable paginationData = []

  @action setPagination = (value) => {
    this.paginationData = value
  }

  @observable loading = false

  @action
  closeLoading = () => {
    this.loading = false
  }

  @action
  handleGetParams(isExport) {
    const { begin, end, dataType } = this.filter
    console.log(begin, end)
    const common = {
      time_range: [
        {
          begin_time: begin,
          end_time: end,
          time_field: dataType,
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

  @action
  handleSearch = (pagination = { limit: 10, offset: 0 }) => {
    this.loading = true
    return Request('station_statistics/shop_without_order')
      .common(this.handleGetParams())
      .limit(pagination.limit)
      .offset(pagination.offset)
      .post()
  }

  @action
  handleExport = (pagination = { limit: 10, offset: 0 }) => {
    const data = this.handleGetParams()
    data.export = 1
    return Request('station_statistics/shop_without_order')
      .common(data)
      .limit(pagination.limit)
      .offset(pagination.offset)
      .post()
  }
}

export default new Store()
