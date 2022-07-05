import { i18next } from 'gm-i18n'
import { action, computed, observable } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { calculateCycleTime } from 'common/util'
import { withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'

const date = moment().startOf('day')

const initFilter = {
  dateType: '1', // '1'：下单日期，'2'：运营周期，'3'：收货时间
  begin: date,
  end: date,
  time_config_id: '',
  routeSelected: { value: 0, text: i18next.t('全部线路') },
  carrier_id_and_driver_id: [],
  search_text: '',
}

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.POINTS_DETAIL,
  selector: ['filter.dateType'],
})
class ExchangeDetailStore {
  @observable filter = { ...initFilter }

  @observable list = []

  @observable serviceTime = []

  @observable routeList = [] // 线路信息

  @observable carrierDriverList = [] // 司机信息

  @action
  initList() {
    this.filter = { ...initFilter }
    this.list = []
  }

  @action
  setFilter(value) {
    // this.filter[field] = value
    this.filter = { ...this.filter, ...value }
  }

  @action
  reset() {
    this.filter = initFilter
  }

  @action
  setFilterDate(begin, end) {
    this.filter.begin = begin
    this.filter.end = end
  }

  @computed
  get getFilterParam() {
    const {
      dateType,
      begin,
      end,
      time_config_id,
      routeSelected,
      carrier_id_and_driver_id,
      search_text,
    } = this.filter
    const params = {}

    const service_time = _.find(
      this.serviceTime,
      (s) => s._id === time_config_id
    )
    if (dateType === '2') {
      params.time_config_id = time_config_id
      params.cycle_start_time = calculateCycleTime(begin, service_time).begin
      params.cycle_end_time = calculateCycleTime(end, service_time).end
    } else if (dateType === '1') {
      params.order_time_begin = moment(begin).format('YYYY-MM-DD')
      params.order_time_end = moment(end).format('YYYY-MM-DD')
    } else {
      params.receive_begin_time = moment(begin).format('YYYY-MM-DD')
      params.receive_end_time = moment(end).format('YYYY-MM-DD')
    }

    if (routeSelected && routeSelected.value) {
      params.route_id = routeSelected.value
    }

    if (carrier_id_and_driver_id.length > 0) {
      if (carrier_id_and_driver_id[0] === '-1') {
        params.unassigned = 1
      } else {
        params.carrier_id = carrier_id_and_driver_id[0] || null
        params.driver_id = carrier_id_and_driver_id[1] || null
      }
    }

    if (search_text) {
      params.search_text = search_text
    }

    return params
  }

  // 兑换明细列表
  @action
  fetchData(pagination = {}) {
    const params = {
      ...this.getFilterParam,
      ...pagination,
    }
    return Request('/station/point/order/reward_sku/list')
      .data(params)
      .get()
      .then(
        action((json) => {
          this.list = json.data.exchange_list
          return json
        })
      )
  }

  @action
  getServiceTime() {
    return Request('/service_time/list')
      .get()
      .then(
        action((json) => {
          this.serviceTime = json.data
          if (!this.filter.time_config_id) {
            this.filter.time_config_id = json.data[0]._id
          }
          return json.data
        })
      )
  }

  // 线路信息
  @action
  getRouteList() {
    return Request('/station/address_route/list')
      .data({ limit: 1000 })
      .get()
      .then(
        action((json) => {
          const routeList = json.data || []
          routeList.push({ id: -1, name: i18next.t('无线路') })
          routeList.unshift({ id: 0, name: i18next.t('全部线路') })
          this.routeList = _.map(routeList, (route) => {
            return { value: route.id, text: route.name }
          })
        })
      )
  }

  // 司机信息
  @action
  getDriverList() {
    return Request('/station/task/distribute/get_drivers')
      .data()
      .get()
      .then(
        action((json) => {
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
          carrierDriverList.unshift({ value: '-1', name: i18next.t('未分配') })
          this.carrierDriverList = carrierDriverList
        })
      )
  }

  setPagination(pagination) {
    this.pagination = pagination
  }
}

export default new ExchangeDetailStore()
