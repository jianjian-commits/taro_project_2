import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import { DBActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import { i18next } from 'gm-i18n'
import _ from 'lodash'

import { isEndOfDay, calculateCycleTime } from 'common/util'

class Store {
  @observable pickTasks = []
  @observable pickDetail = null
  @observable loadingDetail = false
  @observable isLoading = false
  @observable service_times = []
  @observable pagination = {
    count: 0,
    offset: 0,
    limit: 10,
  }

  @observable isSelectedAllPage = false
  @computed get count() {
    if (this.isSelectedAllPage) {
      return null
    }
    return this.selected.length
  }

  @action
  resetPagination = () => (this.pagination.offset = 0)

  @action
  setSelectAllPage = (bool) => (this.isSelectedAllPage = bool)

  @action
  toggleSelectAllPage = () => (this.isSelectedAllPage = !this.isSelectedAllPage)

  @action changePagination = (config) =>
    (this.pagination = { ...this.pagination, ...config })

  @action changeSearchQuery = (newValue) => {
    this.searchQuery = { ...this.searchQuery, ...newValue }
  }

  @action
  fetchStationServiceTime = () => {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const serviceTimes = json.data
        this.service_times = serviceTimes

        const localId = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.ORDER_VIEW_ORDER_TIME,
        )
        const { initServiceTimeId } = DBActionStorage.helper
        const curId = this.searchQuery.time_config_id
        // 初始化运营时间
        initServiceTimeId(curId, localId, serviceTimes, (val) => {
          this.changeSearchQuery({ time_config_id: val })
        })
      })
  }

  @action
  getDriverList = () => {
    return Request('/station/task/distribute/get_drivers')
      .data()
      .get()
      .then((json) => {
        const [driverList, carriers] = json.data
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
        this.carrierDriverList = carrierDriverList
      })
  }

  // 表格操作
  @observable selected = []
  @action
  changeSelected = (arr) => (this.selected = arr)

  formatDate = () => {
    const { dateType, begin, end, time_config_id } = this.searchQuery
    const data = { query_type: dateType }
    const begin_new = isEndOfDay(begin)
    const end_new = isEndOfDay(end)
    const service_time = _.find(
      this.service_times,
      (s) => s._id === time_config_id,
    )

    switch (dateType) {
      case '1':
        data.order_time_begin = begin_new
        data.order_time_end = end_new
        break
      case '2':
        data.time_config_id = time_config_id
        data.cycle_start_time = calculateCycleTime(begin, service_time).begin
        data.cycle_end_time = calculateCycleTime(end, service_time).end
        break
      case '3':
        data.receive_begin_time = begin_new
        data.receive_end_time = end_new
        break
      default:
        break
    }
    return data
  }
}

export default Store
