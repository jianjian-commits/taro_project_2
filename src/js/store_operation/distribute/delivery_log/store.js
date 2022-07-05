import React from 'react'
import { i18next } from 'gm-i18n'
import { Tip, RightSideModal } from '@gmfe/react'
import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import util from '../util'
import { getXlsxJson } from './get_xlsx'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import TaskList from '../../../task/task_list'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../../common/action_storage_key_names'

const today = moment().startOf('day')
const { calculateCycleTime } = util

// 唤起异步任务
const openAsyncTask = (key) => {
  RightSideModal.render({
    children: <TaskList tabKey={key} />,
    onHide: RightSideModal.hide,
    style: {
      width: '300px',
    },
  })
}

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.DELIVERY_LOG,
  selector: [{ filter: ['query_type', 'time_config_id'] }, 'service_times'],
})
class DeliveryStore {
  @observable filter = {
    query_type: '1', // 1:下单 2:运营 3:收货
    time_config_id: '',
    begin_time: today,
    end_time: today,
    search_text: '',
    selected_route: { value: 0, text: i18next.t('全部线路') },
    carrier_id_and_driver_id: [],
  }

  /* ------- filter --------- */
  // 服务时间
  @observable service_times = []

  // 线路列表
  @observable routeList = [
    { value: 0, text: i18next.t('全部线路') },
    { value: -1, text: i18next.t('无线路') },
  ]

  // 二级联动的司机列表
  @observable carrierDriverList = [{ value: -1, name: i18next.t('未分配') }]

  @observable list = []

  @observable in_query = false

  @observable pagination = { count: 0 }

  // 选中的编辑单据
  @observable selectedList = []

  @observable isSelectAllPage = false

  doFirstRequest = () => {} // doFirstRequest有ManagePaginationV2提供

  @action
  setDoFirstRequest(func) {
    this.doFirstRequest = func
  }

  @action.bound
  handleSelectAllPage = (bool) => {
    this.isSelectAllPage = bool
  }

  getReqParams = (paramsFromManagePaginationV2 = {}) => {
    const service_times = this.service_times
    const {
      begin_time,
      end_time,
      query_type,
      search_text,
      time_config_id,
      carrier_id_and_driver_id,
      selected_route,
    } = this.filter

    if (moment(begin_time).add(31, 'd').isBefore(end_time)) {
      Tip.warning(i18next.t('时间范围不能超过31天'))
      return false
    }

    const reqParams = {
      query_type,
      search_text: search_text.trim() || null,
      driver_id: carrier_id_and_driver_id[1],
      route_id: selected_route.value,
    }

    if (carrier_id_and_driver_id[0] === -1) {
      // 司机未分配筛选
      reqParams.unassigned = 1
    } else {
      reqParams.carrier_id = carrier_id_and_driver_id[0]
    }

    const begin = moment(begin_time).format('YYYY-MM-DD')
    const end = moment(end_time).format('YYYY-MM-DD')
    // 按下单时间搜索
    if (query_type === '1') {
      reqParams.order_time_begin = begin
      reqParams.order_time_end = end
    }
    // 按收货时间
    if (query_type === '3') {
      reqParams.receive_begin_time = begin
      reqParams.receive_end_time = end
    }
    // 按运营时间
    if (query_type === '2') {
      const service_time = _.find(
        service_times,
        (s) => s._id === time_config_id,
      )
      reqParams.cycle_start_time = calculateCycleTime(begin, service_time).begin
      reqParams.cycle_end_time = calculateCycleTime(end, service_time).end
      reqParams.time_config_id = time_config_id
    }

    return Object.assign(reqParams, paramsFromManagePaginationV2)
  }

  @action.bound
  async fetchList(paramsFromManagePaginationV2 = {}) {
    const req = this.getReqParams(paramsFromManagePaginationV2)
    if (!req) return Promise.reject(i18next.t('时间范围不能超过31天'))

    const json = await Request('/delivery/list').data(req).get()

    const { in_query = false, order = [] } = json.data || {}

    runInAction(() => {
      this.list = order
      this.in_query = in_query
      this.pagination = json.pagination
      this.selectedList = []
    })

    return json
  }

  @action.bound
  async syncOrder() {
    const req = this.getReqParams()
    if (!req) return Promise.reject(i18next.t('时间范围不能超过31天'))

    await Request('/delivery/sync_order').data(req).get()
    openAsyncTask(1)
    this.doFirstRequest()
  }

  @action.bound
  getServerTimes() {
    Request('/service_time/list')
      .get()
      .then(
        action('getServerTimes', (json) => {
          this.service_times = json.data
          const { time_config_id } = this.filter
          const { validateServiceTimeId } = DBActionStorage.helper
          // 校验下
          validateServiceTimeId(time_config_id, this.service_times, (val) => {
            this.filter.time_config_id = val
          })
        }),
      )
  }

  @action.bound
  getDriverList() {
    return Request('/station/task/distribute/get_drivers')
      .get()
      .then((json) => {
        const [driverList, carriers] = json.data
        // 承运商列表
        const carrierList = carriers.slice()
        _.each(carrierList, (v) => {
          v.name = v.company_name
        })
        carrierList.unshift({ id: 0, name: i18next.t('全部承运商') })

        const _driverList = _.map(driverList, (obj) => {
          return {
            value: obj.id,
            name: `${obj.name}${obj.state ? '' : i18next.t('(停用)')}`,
            carrier_id: obj.carrier_id,
            state: obj.state,
          }
        })
        // 司机按承运商分组
        const driverGroup = _.groupBy(_driverList, 'carrier_id')
        const carrierDriverList = []

        _.each(carriers, (obj) => {
          const carrier = {
            name: obj.company_name,
            value: obj.id,
          }
          // 如果存在这个运营商
          if (driverGroup[obj.id]) {
            carrier.children = driverGroup[obj.id]
            carrierDriverList.push(carrier)
          }
        })

        runInAction(() => {
          this.carrierDriverList = [
            { value: -1, name: i18next.t('未分配') },
          ].concat(carrierDriverList)
        })
        return json
      })
  }

  @action.bound
  getRouteList() {
    return Request('/station/address_route/list')
      .data({ limit: 1000 })
      .get()
      .then((json) => {
        const { data = [] } = json
        const routeList = _.map(data, (item) => {
          return {
            value: item.id,
            text: item.name,
          }
        })
        routeList.push({ value: -1, text: i18next.t('无线路') })
        routeList.unshift({ text: i18next.t('全部线路') })

        runInAction(() => {
          this.routeList = routeList
        })
        return json
      })
  }

  @action
  listSelect(selected) {
    this.selectedList = selected
  }

  @action
  listSelectAll(all) {
    let selected = []
    if (all) {
      selected = _.map(this.list.slice(), (item) => item.order_id)
    }
    this.selectedList = selected
  }

  @action.bound
  deleteDelivery(order_id, index) {
    return Request('/delivery/delete')
      .data({ order_id, type: 2 })
      .post()
      .then(() => {
        this.list.splice(index, 1)
        this.pagination.count--
        Tip.success(i18next.t('删除成功'))
      })
  }

  @action.bound
  setSearchFilter(key, value) {
    this.filter[key] = value
  }

  @action.bound
  exportExcel() {
    const req = this.getReqParams()
    if (!req) return Promise.reject(i18next.t('时间范围不能超过31天'))

    return Request('/delivery/export')
      .data(req)
      .get()
      .then((json) => {
        if (!json.data) return

        if (json.data.async === 0) {
          requireGmXlsx((res) => {
            const { jsonToSheet } = res

            const type = +req.query_type
            const jsonList = getXlsxJson(json, type)
            const sheetOption = {
              SheetNames: [i18next.t('订单明细'), i18next.t('商品明细')],
            }
            jsonToSheet(jsonList, {
              ...sheetOption,
              fileName: json.data.filename,
            })
          })
        } else {
          openAsyncTask(0)
        }
      })
  }
}

export default new DeliveryStore()
