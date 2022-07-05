import { action, observable, toJS, runInAction } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  getServiceTime,
  getOrderList,
  postOrderList,
  getProcessOrderStock,
  getRouteList,
  getDriverList,
  getAddressLabel,
  getProcessLabelList,
} from '../api'
import { calculateCycleTime } from 'common/util'
import { i18next } from 'gm-i18n'
import { driverListAdapter } from '../utils'

const initFilter = {
  beginDate: moment(new Date()).format('YYYY-MM-DD'),
  endDate: moment(new Date()).format('YYYY-MM-DD'),

  time_config_id: '',
  status: '0',
  q: '',
  q_type: 1,

  route_id: null,
  driver_ids: [],
  address_labels: [],
  process_labels: [],
}

class TaskStore {
  @observable filter = { ...initFilter }

  @observable isAllSelected = false

  @observable doFirstRequest = _.noop()

  // 任务信息
  @observable taskList = []

  @observable selectedList = []

  // 物料信息
  @observable materials = []

  @observable skuSelectedList = []

  @observable isSelectAllPage = false

  // 线路
  @observable routeList = []

  // 线路选择
  @observable routeSelected = null

  // 运营时间
  @observable serviceTime = []

  // 司机
  @observable carrierDriverList = []

  // 司机选择
  @observable driverSelected = []

  // 商户标签
  @observable addressLabelList = []

  // 商户选择
  @observable addressLabelSelected = []

  // 商品加工标签
  @observable processLabelList = []

  // 商品加工标签选择
  @observable processLabelSelected = []

  // 订单任务选择
  @observable taskSelected = []

  // 待发布任务的临时数据
  @observable publishSelectedData = []

  /**
   * 设置待处理的发布数据
   * @param {array} data 待处理的发布数据
   */
  @action
  setPublishData(data) {
    this.publishSelectedData = data
  }

  /**
   * 改变待处理待发布数据
   * @param {number} index 下标
   * @param {object} changeData 改变的数据
   */
  @action
  changePublishDataItem(index, changeData) {
    Object.assign(this.publishSelectedData[index], changeData)
  }

  @action
  setDateRangeDetail(begin, end) {
    this.filter.beginDate = begin
    this.filter.endDate = end
  }

  @action
  setDoFirstRequest(func) {
    // doFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @action
  clearTableSelect() {
    this.skuSelectedList = []
    this.isSelectAllPage = false
  }

  @action
  clearTaskList() {
    this.taskList = []
  }

  @action
  setSelectedPlaneNum(index, value) {
    this.selectedList[index].release_amount = value
  }

  @action
  setFilter(type, value) {
    this.filter[type] = value
  }

  @action
  changeDriverSelected(selected) {
    this.driverSelected = selected
  }

  @action
  changeRouteSelect(selected) {
    this.routeSelected = selected
    this.filter.route_id = selected ? selected.value : null
  }

  @action
  changeAddressLabelSelected(selected) {
    console.log(selected)
    this.addressLabelSelected = selected
    this.filter.address_labels = _.map(selected, (item) => item.value)
  }

  @action
  changeProcessLabelSelected(selected) {
    this.processLabelSelected = selected
    this.filter.process_labels = _.map(selected, (item) => item.value)
  }

  // 订单任务列表选择
  @action
  changeTaskSelected(selected) {
    this.taskSelected = selected
  }

  @action
  setItemSelect(flag, index) {
    const taskList = [...this.taskList.slice()]
    if (index !== undefined) {
      taskList[index]._selected = flag
    } else {
      this.isAllSelected = flag
      _.each(taskList, (task) => {
        if (task.status === 1) {
          task._selected = flag
        }
      })
    }
    this.taskList = taskList
  }

  @action
  handleTaskSelect(selected) {
    this.skuSelectedList = selected
    const allCanSelect = this.taskList
      .slice()
      .filter((item) => item.status <= 1)
      .map((item) => item.sku_hash)
    if (selected.length < allCanSelect.length) {
      this.isSelectAllPage = false
    }
  }

  @action
  handleTaskSelectAll(all) {
    let selected = []
    if (all) {
      selected = this.taskList
        .slice()
        .filter((item) => item.status <= 1)
        .map((item) => item.sku_hash)
    }
    this.skuSelectedList = selected
  }

  @action
  handleChangeSelectAllType(bool) {
    this.isSelectAllPage = bool
  }

  @action
  getFilterData() {
    const {
      status,
      beginDate,
      endDate,
      time_config_id,
      q,
      q_type,
      route_id,
      address_labels,
      process_labels,
    } = this.filter
    const { driverSelected } = this
    const service_time = _.find(
      this.serviceTime,
      (s) => s._id === time_config_id,
    )

    const driver_ids = []
    // 长度为1时，只选中了承运商，因此需要得到以下司机list
    if (driverSelected.length === 1) {
      // 未分配需要传-1
      if (driverSelected[0] === -1) {
        driver_ids.push(-1)
      } else {
        _.each(this.carrierDriverList, (item) => {
          if (item.value === driverSelected[0]) {
            _.each(item.children, (child) => {
              driver_ids.push(child.value)
            })
          }
        })
      }
    } else if (driverSelected.length === 2) {
      driver_ids.push(driverSelected[driverSelected.length - 1])
    }

    return {
      status: status,
      time_config_id: time_config_id,
      begin_time: calculateCycleTime(beginDate, service_time).begin,
      end_time: calculateCycleTime(endDate, service_time).end,
      q,
      q_type,
      route_id: route_id || undefined,
      driver_ids:
        driver_ids.length > 0 ? JSON.stringify(driver_ids) : undefined,
      address_labels:
        address_labels.length > 0 ? JSON.stringify(address_labels) : undefined,
      process_labels:
        process_labels.length > 0 ? JSON.stringify(process_labels) : undefined,
    }
  }

  /**
   * 获取发布数据
   * @param {int} is_submit 0:仅发布，1:发布且下达
   */
  @action
  getPublishTaskData(is_submit, only_out_of_stock) {
    const postData = {
      is_submit,
      only_out_of_stock,
      ...this.getFilterData(),
      status: null,
    }
    // 由于发布任务可以从商品和订单处触发，因此不能依据isSelectAllPage来传all字段，根据待发布数据是否为空来判断即可
    postData.all = this.publishSelectedData.length > 0 ? 0 : 1 // 1为全部页

    postData.release_list = JSON.stringify(
      _.map(this.publishSelectedData, (item) => {
        return {
          ids: item.ids,
          amount: item.req_release_amount,
        }
      }),
    )

    return postData
  }

  @action
  getServiceTime() {
    return getServiceTime().then((json) => {
      const data = json.data
      runInAction(() => {
        this.serviceTime = data
        data && (this.filter.time_config_id = data[0]._id)
      })

      return data
    })
  }

  @action
  getTaskList(pagination = {}) {
    const data = Object.assign({}, toJS(this.getFilterData()), pagination)
    return getOrderList(data).then((json) => {
      runInAction(() => {
        const taskData = _.map(json.data, (item, index) => {
          return { ...item, _index: index }
        })
        this.taskList = taskData
      })

      return json
    })
  }

  @action
  postTaskList(is_submit) {
    return postOrderList(this.getPublishTaskData(is_submit))
  }

  @action
  getProcessOrderStock(sku_id, version) {
    return getProcessOrderStock({ sku_id, version }).then((json) => {
      this.materials = json.data
      return json
    })
  }

  /**
   * 获取线路
   * @param {object} query
   */
  @action.bound
  fetchRouteList(query = { limit: 1000 }) {
    return getRouteList(query).then((json) => {
      const routeList = _.map(json.data || [], (item) => {
        return {
          value: item.id,
          text: item.name,
        }
      })
      routeList.push({ value: -1, text: i18next.t('无') })
      routeList.unshift({ text: i18next.t('全部线路'), value: null })

      runInAction(() => {
        this.routeList = routeList
      })
    })
  }

  @action.bound
  fetchDriverList(query = { limit: 1000 }) {
    return getDriverList(query).then((json) => {
      runInAction(() => {
        this.carrierDriverList = driverListAdapter(json.data)
      })

      return json
    })
  }

  @action
  fetchAddressLabelList(query = { limit: 1000 }) {
    return getAddressLabel(query).then((json) => {
      runInAction(() => {
        const dataForSelect = _.map(json.data, (item) => {
          return {
            ...item,
            text: item.name,
            value: item.id,
          }
        })
        dataForSelect.push({ value: -1, text: i18next.t('无') })

        this.addressLabelList = dataForSelect
      })
    })
  }

  @action
  fetchProcessLabelList(query = { limit: 1000 }) {
    return getProcessLabelList(query).then((json) => {
      runInAction(() => {
        const dataForSelect = _.map(json.data, (item) => {
          return {
            ...item,
            text: item.name,
            value: item.id,
          }
        })
        dataForSelect.push({
          text: i18next.t('无'),
          value: -1,
        })

        this.processLabelList = dataForSelect
      })
    })
  }
}

export default new TaskStore()
