import { observable, action, toJS } from 'mobx'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import moment from 'moment'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../../common/action_storage_key_names'
import { getOrderTypeId } from '../../../common/deal_order_process'

import Utils from '../util'
import { initOrderType } from '../../../common/enum'

const { calculateCycleTime } = Utils

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_TASK_LINE_TAB,
  selector: [{ filter: ['dateType', 'time_config_id'] }, 'service_times'],
})
class LineTaskStore {
  @observable
  filter = {
    dateType: '1',
    begin: new Date(),
    end: new Date(),
    q: '',
    time_config_id: '',
    orderType: initOrderType, // 默认常规
  }

  @observable selectedLineTaskList = []

  @observable isSelectAllPage = false

  getFilter() {
    const filter = toJS(this.filter)
    const { begin, end, dateType, time_config_id, orderType } = filter

    // 按运营时间搜索
    if (+dateType === 2) {
      const service_time = _.find(
        this.service_times,
        (s) => s._id === time_config_id
      )
      filter.begin = calculateCycleTime(begin, service_time).begin + ':00'
      filter.end = calculateCycleTime(end, service_time).end + ':00'
    } else {
      delete filter.time_config_id
      // 这里接口特殊要求要统一带上分秒 一般只有 按运营时间搜索才带上
      filter.begin = `${moment(begin).format('YYYY-MM-DD')} 00:00:00`
      filter.end = `${moment(end).format('YYYY-MM-DD')} 23:59:59`
    }

    // 涉及比较多不敢乱动 只能赋个新对象出来发请求
    let newFilterData = {}
    newFilterData.date_type = filter.dateType
    newFilterData.start_date = filter.begin
    newFilterData.end_date = filter.end
    newFilterData.time_config_id = filter.time_config_id
    newFilterData.q = filter.q

    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      newFilterData = {
        ...newFilterData,
        order_process_type_id,
      }
    }

    return newFilterData
  }

  @action handleToggleSelectAllPage = (bool) => {
    this.isSelectAllPage = bool
  }

  @action
  filterChange(filter) {
    const filterObj = { ...this.filter, ...filter }
    this.filter = filterObj
  }

  @observable
  service_times = []

  @action
  fetchServiceTime() {
    Request('/service_time/list')
      .get()
      .then(
        action((json) => {
          this.service_times = json.data
          const { time_config_id } = this.filter
          const { validateServiceTimeId } = DBActionStorage.helper
          // 校验下
          validateServiceTimeId(time_config_id, this.service_times, (val) => {
            this.filter.time_config_id = val
          })
        })
      )
  }

  @observable lineTaskList = []

  @observable pagination = {
    page_obj: null,
  }

  @action.bound
  getLineTaskList(pagination = {}) {
    const data = {
      ...this.getFilter(),
      ...pagination,
    }
    return Request('/station/task/distribute/route_task')
      .data(data)
      .get()
      .then((json) => {
        this.lineTaskList = json.data.route_tasks
        this.pagination = json.pagination

        return json
      })
  }

  @action
  linSelect(selected) {
    this.selectedLineTaskList = selected
  }

  @action
  reset_pagination() {
    this.pagination = {
      page_obj: null,
    }
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  handleSearch() {
    this.reset_pagination()
    this.getLineTaskList()
  }
}

export default new LineTaskStore()
