import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import { calculateCycleTime, getDateRangeByType } from 'common/util'
import { dealRankData } from 'common/deal_rank_data'

const initFilter = {
  begin_time: moment().subtract(7, 'days').format('YYYY-MM-DD'),
  end_time: moment().format('YYYY-MM-DD'),
  dateType: '1', // 时间类型
  time_config_id: '',
  rank_type: 1, // 搜索条件 1-任务数 2-销售额
  dateRangeType: '2', // 时间段: 1-今天 2-近7天 3-近30天
}
@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.DRIVER_PERFORMANCE_FILTER_TIME,
  selector: [
    {
      storageFilter: [
        'dateType',
        'rank_type',
        'time_config_id',
        'dateRangeType',
      ],
    },
  ],
})
class Store {
  @observable isFullScreen = false
  // 非投屏页
  @observable filter = { ...initFilter }
  // 投屏页搜索条件 存入缓存中
  @observable storageFilter = { ...initFilter }

  @observable serviceTimes = [] // 所有运营时间 [{ _id, name, ... }]
  @observable serviceTimesSelectList = [] // 运营时间下拉框数据 显示用 [{ value, text }]

  // 司机绩效排行数据
  @observable driverRankData = {
    beforeThirdData: [],
    restData: [],
  }

  @action
  init() {
    this.isFullScreen = false
    this.serviceTimes = []
    this.serviceTimesSelectList = []
    this.driverRankData = {
      beforeThirdData: [],
      restData: [],
    }
  }

  @action
  setFilterValue(value, key) {
    this.filter[key] = value
  }

  @action
  setValue(value, key) {
    this[key] = value
  }

  @action
  setDateFilterChange(obj) {
    this.filter = {
      ...this.filter,
      begin_time: obj.begin_time,
      end_time: obj.end_time,
      dateRangeType: obj.type,
    }
  }

  /**
   * 处理传给后端的参数
   */
  @computed
  get getFilterParams() {
    const filter = this.isFullScreen ? this.storageFilter : this.filter
    const { dateType, time_config_id, rank_type, dateRangeType } = filter
    const dateRange = getDateRangeByType(dateRangeType)
    let time = null
    if (dateType === '1') {
      time = {
        order_start_time: moment(dateRange.begin_time).format('YYYY-MM-DD'),
        order_end_time: moment(dateRange.end_time).format('YYYY-MM-DD'),
      }
    } else if (dateType === '2') {
      const service_time = _.find(
        this.serviceTimes,
        (s) => s._id === time_config_id,
      )
      time = {
        time_config_id,
        cycle_start_time: calculateCycleTime(dateRange.begin_time, service_time)
          .begin,
        cycle_end_time: calculateCycleTime(dateRange.end_time, service_time)
          .end,
      }
    } else if (dateType === '3') {
      time = {
        receive_start_time: moment(dateRange.begin_time).format('YYYY-MM-DD'),
        receive_end_time: moment(dateRange.end_time).format('YYYY-MM-DD'),
      }
    }

    return {
      q_type: +dateType,
      rank_type: rank_type,
      ...time,
    }
  }

  @action
  fetchList() {
    return Request('/station/task/distribute/driver/rank')
      .data(this.getFilterParams)
      .timeout(60000)
      .get()
      .then(
        action((json) => {
          this.driverRankData = dealRankData(
            'driver',
            json.data,
            this.filter.rank_type,
          )
          // 非投屏模式 保存搜索条件 给投屏页用
          if (!this.isFullScreen) {
            this.storageFilter = { ...this.filter }
          }
        }),
      )
  }

  /**
   * 拉取运营时间
   */
  @action
  fetchServiceTime() {
    return Request('/station/service_time')
      .get()
      .then((json) => {
        this.serviceTimes = json.data
        this.serviceTimesSelectList = _.map(json.data, (item) => ({
          value: item._id,
          text: item.name,
        }))
        const filter = this.isFullScreen ? this.storageFilter : this.filter
        const { time_config_id } = filter
        const { validateServiceTimeId } = DBActionStorage.helper
        // 校验下 运营周期不存在则默认取第一个
        validateServiceTimeId(time_config_id, this.serviceTimes, (val) => {
          this.isFullScreen
            ? (this.storageFilter.time_config_id = val)
            : (this.filter.time_config_id = val)
        })
      })
  }
}

export default new Store()
