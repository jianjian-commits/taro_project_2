import { action, computed, observable, reaction, runInAction } from 'mobx'
import moment from 'moment'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import { isInvalidLocation } from 'common/util'
import _ from 'lodash'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import {
  dispatchMsg,
  getColorByDriverID,
} from '../../../store_operation/distribute/driver_scheduling/util'
import { getGraspRoadSupreme } from './amap_plugins'

const today = moment().startOf('day')

export const marker = {
  distributingMarker: {
    value: Symbol('distributingMarker'),
    name: t('显示未签收客户'),
    initShow: true,
  },
  receiveMarker: {
    value: Symbol('receiveMarker'),
    name: t('显示已签收客户'),
    initShow: true,
  },
  trace: {
    value: Symbol('trace'),
    name: t('显示司机行驶轨迹'),
    initShow: false,
  },
  stayDelayMarker: {
    value: Symbol('stayDelayMarker'),
    name: t('显示司机滞留点'),
    initShow: false,
  },
  driverMarker: {
    value: Symbol('driverMarker'),
    name: t('显示司机位置'),
    initShow: true,
  },
}

export const markerList = _.map(marker, (v) => v)

const initDriverMarker = {
  position: {
    latitude: 0,
    longitude: 0,
  },
  driver_name: null,
}

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_CONTROL_CENTER,
  selector: ['filter.date_type'],
})
class Store {
  constructor() {
    // 自动轨迹纠偏
    this.r = reaction(
      () => this.originTraceList, // 当原始轨迹点增加才去重新纠偏
      async (originTraceList) => {
        if (window.AMap) {
          // 轨迹纠偏后的轨迹
          this.traceList = await Promise.all(
            originTraceList.map((line) => getGraspRoadSupreme(line)),
          )
        }
      },
    )
    this.getServerTimes()
    this.getDriverList()
  }

  @observable showMarkers = new Set(
    markerList.filter((o) => o.initShow).map((o) => o.value),
  )

  @action.bound
  setShowMarkers(selected) {
    this.showMarkers = new Set(selected)
  }

  // lat == 0 && lng == 0 表示没有位置
  @observable driverMarker = initDriverMarker

  @observable isLoading = false

  @observable filter = {
    date_type: '1',
    start_time: today,
    time_config_id: '',
    cycle_start_time: today,
    search: '',
    carrier_id_and_driver_id: [],
  }

  @observable carrierDriverList = []
  _driverList = []

  @observable service_times = []

  @observable list = []

  /* ------ 地图点和线 ------ */
  // 用来展示的轨迹(经过高德纠偏处理)
  @observable traceList = []
  // originTraceList轨迹:  [{
  //           driver_id:   司机id,
  //           carrier_name: 承运商名字,
  //           driver_name: 司机名字,
  //           trace_id: 轨迹id,
  //           trace_status: {Number}  轨迹状态,  0-进行中 1-已经结束
  //           color: 轨迹颜色,
  //           showDir:true, 展示箭头
  //           path: [{ latitude, longitude }, ...]
  //         }]
  @observable originTraceList = []

  updateTraceListTimer = null
  getDriverMarkerTimer = null

  // 已签收商户
  @observable receiveMarkerList = []

  // 未签收商户
  @observable distributingMarkerList = []

  // 滞留点
  @observable stayDelayMarkerList = []

  /* ------ 三种图标数组: 货车,起点,终点 ------ */
  @computed get computed3Markers() {
    const carList = []
    const startPointList = []
    const endPointList = []
    // trace_id == 0,这种轨迹是没有意义的.去掉
    this.originTraceList
      .filter((line) => line.trace_id > 0)
      .forEach((line) => {
        const { driver_name, carrier_name, trace_status, path } = line

        const firstPoint = path[0]
        const lastPoint = path[path.length - 1]

        // trace_status = 0, 轨迹进行中, 展示货车图标
        if (trace_status === 0) {
          carList.push({
            driver_name,
            carrier_name,
            angle: lastPoint.direction, // markers,的偏转方向
            position: {
              longitude: lastPoint.longitude,
              latitude: lastPoint.latitude,
            },
          })
        } else {
          // 轨迹结束,展示起点 和 终点
          startPointList.push({
            driver_name,
            carrier_name,
            position: {
              longitude: firstPoint.longitude,
              latitude: firstPoint.latitude,
            },
          })
          endPointList.push({
            driver_name,
            carrier_name,
            position: {
              longitude: lastPoint.longitude,
              latitude: lastPoint.latitude,
            },
          })
        }
      })

    return {
      carList,
      startPointList,
      endPointList,
    }
  }

  @action.bound
  setFilter(key, value) {
    this.filter[key] = value
  }

  getQuery() {
    const {
      date_type,
      start_time,
      time_config_id,
      cycle_start_time,
      search,
      carrier_id_and_driver_id,
    } = this.filter

    const [carrier_id, driver_id] = carrier_id_and_driver_id

    const time =
      date_type === '2'
        ? {
            cycle_start_time: moment(cycle_start_time).format(
              'YYYY-MM-DD HH:mm:ss',
            ),
            cycle_end_time: moment(cycle_start_time)
              .add(1, 'd')
              .startOf('day')
              .format('YYYY-MM-DD HH:mm:ss'),
          }
        : {
            start_time: moment(start_time).format('YYYY-MM-DD HH:mm:ss'),
            end_time: moment(start_time)
              .add(1, 'd')
              .format('YYYY-MM-DD HH:mm:ss'),
          }

    return {
      date_type,
      ...time,
      time_config_id: date_type === '2' ? time_config_id : undefined,
      search: search.trim() || undefined,
      carrier_id,
      driver_id,
    }
  }

  @action.bound
  async fetchData() {
    this.isLoading = true

    const query = this.getQuery()
    const { driver_count, address_count } = await Request(
      '/driver_performance/delivery_task/list',
    )
      .data(query)
      .get()
      .then((json) => json.data)

    // 商户标记
    const receiveMarkerList = []
    const distributingMarkerList = []
    _.each(address_count, (address) => {
      const {
        address_name,
        drivers,
        received,
        total,
        latitude,
        longitude,
      } = address
      // 有效点才展示
      if (!isInvalidLocation(latitude, longitude)) {
        const marker = {
          address_name,
          drivers,
          position: { latitude, longitude },
        }
        if (received === total) {
          receiveMarkerList.push(marker)
        } else {
          distributingMarkerList.push(marker)
        }
      }
    })

    const {
      originTraceList,
      stayDelayMarkerList,
      tableList,
    } = await this.fetchTraceList(driver_count)

    runInAction(() => {
      this.list = tableList // 列表
      this.stayDelayMarkerList = stayDelayMarkerList // 滞留点

      this.originTraceList = originTraceList // 原始轨迹
      this.traceList = [] // 先清空旧的轨迹

      this.receiveMarkerList = receiveMarkerList
      this.distributingMarkerList = distributingMarkerList

      this.isLoading = false
    })

    // 根据地图上添加的覆盖物分布情况，自动缩放地图到合适的视野级别
    dispatchMsg('map-setFitView')
    const {
      date_type,
      start_time,
      cycle_start_time,
      carrier_id_and_driver_id,
    } = this.filter
    const time = date_type === '2' ? cycle_start_time : start_time

    clearTimeout(this.updateTraceListTimer)
    clearTimeout(this.getDriverMarkerTimer)
    // 当天 && 筛选单个司机 => 就定时轮询新的轨迹点 和 轮询司机位置
    if (moment().isSame(time, 'day') && carrier_id_and_driver_id[1]) {
      this.intervalUpdateTraceList()
      this.intervalGetDriverMarker()
    }
  }

  async fetchTraceList(driver_count) {
    const fetchTraces = (trace_ids) =>
      Request('/driver_performance/trace/list')
        .data({ trace_ids: JSON.stringify(trace_ids) })
        .get()
        .then((json) => json.data)

    const allTraceList = await fetchTraces(driver_count.map((o) => o.trace_id))

    const originTraceList = []
    let stayDelayMarkerList = []
    const tableList = []

    _.each(driver_count, (d, index) => {
      const { driver_id, carrier_name, driver_name } = d

      const traceInfo = allTraceList[index]
      const { points, ...rest } = traceInfo

      // polyline:司机原始轨迹
      originTraceList.push({
        driver_id,
        carrier_name,
        driver_name,
        trace_id: traceInfo.trace_id,
        trace_status: traceInfo.trace_status,
        color: getColorByDriverID(driver_id), // 轨迹颜色: 根据司机id确定
        path: points,
      })

      // marker:找出滞留点
      const stayDelayPoints = points
        .filter((v) => v.delay_time > 300)
        .map((o) => ({
          position: { longitude: o.longitude, latitude: o.latitude },
          delay_time: o.delay_time,
        }))
      stayDelayMarkerList = stayDelayMarkerList.concat(stayDelayPoints)

      // table: 表格
      tableList.push({
        ...d,
        ...rest,
      })
    })

    return { originTraceList, stayDelayMarkerList, tableList }
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

        this._driverList = _.map(driverList, (obj) => {
          return {
            value: obj.id,
            name: `${obj.name}${obj.state ? '' : t('(停用)')}`,
            carrier_id: obj.carrier_id,
          }
        })

        // 司机按承运商分组
        const driverGroup = _.groupBy(this._driverList, 'carrier_id')

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
  async intervalUpdateTraceList() {
    const updateList = this.originTraceList.map((line) => {
      const { driver_id, path, trace_status } = line
      const last_locatetime = path[path.length - 1].locatetime

      const req = {
        driver_id,
        last_locatetime,
      }

      // 轨迹进行中,所以需要查询最新点
      if (trace_status === 0) {
        return Request('/driver_performance/latest_point/list')
          .data(req)
          .get()
          .then((json) => {
            return {
              ...line,
              path: [...path, ...json.data.points], // 增加最后一个点
            }
          })
      } else {
        // 不需要查询最新点,直接返回现有轨迹
        return Promise.resolve(line)
      }
    })

    try {
      // 更新每个司机最新点
      this.originTraceList = await Promise.all(updateList)
    } catch (e) {
      console.error('定时更新轨迹失败了')
    }

    // 5秒刷新一次轨迹
    this.updateTraceListTimer = setTimeout(this.intervalUpdateTraceList, 5000)
  }

  @action.bound
  async intervalGetDriverMarker() {
    const { carrier_id_and_driver_id } = this.filter
    // eslint-disable-next-line
    const [carrier_id, driver_id] = carrier_id_and_driver_id

    if (!driver_id || !this.showMarkers.has(marker.driverMarker.value)) {
      this.driverMarker = initDriverMarker
      clearTimeout(this.getDriverMarkerTimer)
      return
    }

    const { data } = await Request('/driver_performance/last_location')
      .data({ driver_id })
      .get()
      .then((json) => json)

    const driver_name = this._driverList.find((o) => o.value === driver_id).name
    this.driverMarker = {
      position: {
        longitude: data.lng,
        latitude: data.lat,
      },
      driver_name,
    }

    this.getDriverMarkerTimer = setTimeout(this.intervalGetDriverMarker, 5000)
  }
}

export default new Store()
