import { i18next } from 'gm-i18n'
import { action, observable, computed } from 'mobx'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import { searchDateTypes } from '../../../common/enum'
import globalStore from '../../../stores/global'
import { calculateCycleTime } from '../../../common/util'

const date = moment().startOf('day')

const initFilter = {
  time_config_id: '',
  begin: date,
  end: date,
  dateType: searchDateTypes.CYCLE.type,
  search: '',
  route_id: null, // 线路
  routeSelected: null,
  order_box_status: '',
  box_type: null,
  printed: null,
}

class BoxManageStore {
  @observable doFirstRequest = _.noop()

  @observable list = []

  @observable printList = []

  // 是否全选了所有页
  @observable isSelectAllPage = false

  // 所选id 树状结构
  @observable selectedTree = {} // eslint-disable-line

  @observable selectedList = []

  @observable service_times = []

  @observable filter = { ...initFilter }

  // 司机
  @observable carrierDriverList = []

  @observable carrier_id_and_driver_id = []

  @observable routeList = [
    { text: i18next.t('全部线路'), value: null },
    { value: -1, text: i18next.t('无线路') },
  ]

  @observable loading = false

  @action
  initFilter() {
    const { time_config_id, dateType } = this.filter
    this.filter = {
      ...initFilter,
      time_config_id,
      dateType,
    }

    this.carrier_id_and_driver_id = []
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @action
  getBoxOrderList(searchData, page, isExport = 0) {
    if (!searchData) return Promise.resolve(null)

    if (page) {
      searchData = { ...searchData, ...page, export: isExport }
    } else {
      searchData = { ...searchData, offset: 0, limit: 10, export: isExport }
    }

    this.loading = true

    return Request('/box/box_manage/order/list')
      .data(searchData)
      .get()
      .then(
        action((json) => {
          if (isExport) {
            return json
          }
          const list = json.data
          _.forEach(list, (l) => {
            const details = [] // 商品和箱子多对多关系，列表中箱子和商品都要互相组合后单独一行显示
            _.forEach(l.details, (sku) => {
              if (sku.box_list.length === 0) {
                details.push({ ...sku, _key: `${l.order_id}_${sku.detail_id}` })
              }
              _.forEach(sku.box_list, (box) => {
                details.push({
                  ...sku,
                  _key: `${l.order_id}_${box.box_code}_${sku.detail_id}`,
                  box,
                })
              })
            })
            l.children = details
          })

          this.list = list
          this.loading = false
          this.selectedList = []
          this.selectedTree = {}
          this.isSelectAllPage = false
          return json
        }),
      )
  }

  @action
  fetchServiceTime() {
    const query = {}
    if (globalStore.isSupply()) {
      query.station_id = globalStore.purchaseInfo.seller_station_id
    }
    return Request('/service_time/list')
      .get()
      .then(
        action((json) => {
          this.service_times = json.data
          if (json.data.length > 0) {
            this.filter.time_config_id = json.data[0]._id
          }
          return json
        }),
      )
  }

  @action.bound
  getRouteList(query = { limit: 1000 }) {
    return Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        const routeList = _.map(json.data || [], (item) => {
          return {
            value: item.id,
            text: item.name,
          }
        })
        routeList.push({ value: -1, text: i18next.t('无线路') })
        routeList.unshift({ text: i18next.t('全部线路'), value: null })
        this.routeList = routeList
      })
  }

  @action.bound
  getDriverList() {
    return Request('/station/task/distribute/get_drivers')
      .data()
      .get()
      .then((json) => {
        const driverList = json.data[0]
        const carriers = json.data[1]
        const carrierDriverList = []

        const _driverList = _.map(driverList, (obj) => {
          return {
            value: obj.id,
            name: `${obj.name}${obj.state ? '' : i18next.t('(停用)')}`,
            carrier_id: obj.carrier_id,
          }
        })
        // 司机按承运商分组
        const driverGroup = _.groupBy(_driverList, 'carrier_id')

        _.each(carriers, (obj) => {
          const carrier = {
            name: obj.company_name,
            value: obj.id,
          }
          // 如果存在这个运营商
          if (driverGroup[obj.id]) {
            carrier.children = driverGroup[obj.id]
          }
          carrierDriverList.push(carrier)
        })
        return (this.carrierDriverList = carrierDriverList)
      })
  }

  @action
  filterChange(filter) {
    const filterObj = { ...this.filter, ...filter }
    if (filter.dateType) {
      filter.begin = date
      filter.end = date
    }

    this.filter = filterObj
  }

  @action
  driverSelect(carrier_id_and_driver_id) {
    this.carrier_id_and_driver_id = carrier_id_and_driver_id
  }

  @action
  toggleIsSelectAllPage(bool) {
    this.isSelectAllPage = bool
  }

  @action
  setSelected(selected, selectedTree) {
    this.selectedList = selected
    this.selectedTree = selectedTree
    this.isSelectAllPage = false
  }

  @computed
  get searchData() {
    const { carrier_id_and_driver_id, filter } = this
    const {
      time_config_id,
      begin,
      end,
      route_id,
      search,
      order_box_status,
      box_type,
      printed,
    } = filter
    const hasDriver = carrier_id_and_driver_id.slice().length >= 2

    if (moment(begin).add(3, 'M').isBefore(end)) {
      Tip.warning(i18next.t('时间范围不能超过三个月'))
      return null
    }

    const service_time = _.find(
      this.service_times,
      (s) => s._id === time_config_id,
    )

    return {
      route_id,
      box_type,
      printed,
      order_box_status: order_box_status === '' ? null : order_box_status,
      time_config_id,
      begin: moment(calculateCycleTime(begin, service_time).begin).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      end: moment(calculateCycleTime(end, service_time).end).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      carrier_id: hasDriver ? carrier_id_and_driver_id[0] : null,
      driver_id: hasDriver ? carrier_id_and_driver_id[1] : null,
      search,
    }
  }

  @action
  getBoxPrintData(param) {
    return Request('/box/print')
      .data(param)
      .post()
      .then(
        action((json) => {
          this.printList = json.data
          return json
        }),
      )
  }

  @action
  getBoxPrintTemp() {
    return Request('/box_template/list')
      .data()
      .get()
      .then((json) => {
        return [{ id: null, name: i18next.t('按商户配置') }, ...json.data]
      })
  }
}

export default new BoxManageStore()
