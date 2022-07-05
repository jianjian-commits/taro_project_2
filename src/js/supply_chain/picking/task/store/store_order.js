import BaseStore from '../base_store'
import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'
import commonQuery from '../config/search_query_common'
import { Storage } from '@gmfe/react'
import { i18next } from 'gm-i18n'

const initQuery = {
  ...commonQuery,
  area_id: null,
  area_level: null,
  order_status: 0,
  sort_remark: 0,
  routeSelected: [],
  carrier_id_and_driver_id: [],
}
const printTemplateKey = 'PICK_ORDER_PRINT_TEMPLATE_KEY'
const printTemplate = Storage.get(printTemplateKey) || 1
class Store extends BaseStore {
  @observable searchQuery = initQuery
  // 1：按订单打印（一个订单打印一张拣货单）；2：按订单打印（所有订单打印一张拣货）
  @observable printTemplate = printTemplate

  // 拣货查询

  @observable carrierDriverList = []

  @action
  changePrintTemplate = (type) => {
    this.printTemplate = type
    Storage.set(printTemplateKey, type)
  }

  @action
  reset = () => {
    this.searchQuery = initQuery
  }

  @action
  getPickTasks = (data) => {
    this.isLoading = true
    Request('/picking/task/list')
      .data({ ...data, ...this.formatDate() })
      .get()
      .then((json) => {
        this.pickTasks = json.data.task_list
        this.pagination = json.pagination
      })
      .finally(() => {
        this.isLoading = false
      })
  }

  @observable routeList = []

  @action
  getRouteList = (query = { limit: 1000 }) => {
    Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        this.routeList = [
          { id: 0, name: i18next.t('全部线路') },
          { id: -1, name: i18next.t('无线路') },
          ...json.data,
        ]
      })
  }

  // 侧边栏详情和明细打印通用
  @action
  getPickDetail = (order_id) => {
    this.loadingDetail = true
    Request('/picking/task/order/detail')
      .data({ order_id })
      .get()
      .then((json) => (this.pickDetail = json.data))
      .finally(() => (this.loadingDetail = false))
  }

  // 导出
  @action
  handleExport = (data) => {
    return Request('/picking/task/list')
      .data({ ...data, ...this.formatDate() })
      .get()
  }

  @observable sortRemarkList = []

  @action
  getRemarkList = () => {
    Request('/station/weight/sort_remark/list')
      .data(this.formatDate())
      .get()
      .then((json) => {
        this.sortRemarkList = [...new Set(json.data.sort_remark_list)]
      })
  }
}

export default new Store()
