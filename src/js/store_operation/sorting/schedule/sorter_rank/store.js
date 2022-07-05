import { action, observable } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'
import { calculateCycleTime, getDateRangeByType } from 'common/util'
import store from '../../store'
import { dealRankData } from 'common/deal_rank_data'

const initFilter = {
  begin_time: moment().subtract(7, 'day').format('YYYY-MM-DD'),
  end_time: moment().format('YYYY-MM-DD'),
  time_config_id: '',
  type: '2',
}
@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.SORTING_PERFORMANCE_FILTER_TIME,
  selector: ['storageFilter.time_config_id', 'storageFilter.type'],
})
class Store {
  // 是否投屏
  @observable isFullScreen = false
  // 非投屏页 搜索条件
  @observable filter = { ...initFilter }

  // 投屏页 搜索条件存入缓存中
  @observable storageFilter = { ...initFilter }

  // 分拣员绩效排行数据
  @observable sorterRankData = {
    beforeThirdData: [],
    restData: [],
  }

  @action
  init() {
    this.sorterRankData = {
      beforeThirdData: [],
      restData: [],
    }
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  setStorageFilterTimeConfig = (value) => {
    this.storageFilter.time_config_id = value
  }

  @action
  setFullScreen(value) {
    this.isFullScreen = value
  }

  @action
  handleFilterParam(filter) {
    const { type, time_config_id } = filter
    const dateRange = getDateRangeByType(type)
    const service_time = _.find(
      store.serviceTime,
      (s) => s._id === time_config_id,
    )

    return {
      time_config_id: time_config_id,
      cycle_start_time: calculateCycleTime(dateRange.begin_time, service_time)
        .begin,
      cycle_end_time: calculateCycleTime(dateRange.end_time, service_time).end,
    }
  }

  @action
  getSorterRankData() {
    const filter = this.isFullScreen ? this.storageFilter : this.filter
    const params = { ...this.handleFilterParam(filter) }

    Request('/weight/weight_collect/sorter/rank')
      .data(params)
      .get()
      .then(
        action((json) => {
          // 非投屏页 记忆一下搜索条件 给投屏页使用
          if (!this.isFullScreen) {
            this.storageFilter = { ...this.filter }
          }
          this.sorterRankData = dealRankData('sorter', json.data)
        }),
      )
  }
}

export default new Store()
