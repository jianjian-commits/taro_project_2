import { action, computed, observable } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { calculateCycleTime, groupByWithIndex } from '../../../common/util'
import { initOrderType } from '../../../common/enum'
import store from '../store'
import { findDOMNode } from 'react-dom'
import { getOrderTypeId } from '../../../common/deal_order_process'
import { withMobxStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from 'common/action_storage_key_names'

const date = moment().startOf('day').format('YYYY-MM-DD')
const initFilter = {
  target_date: date,
  time_config_id: '',
  orderType: initOrderType, // 默认常规
}
const initOrderData = {
  finished: 0,
  total: 0,
  orders: [],
}
const initScheduleData = {
  total_schedule: {},
  category_schedule: [],
  sort_data: {},
}
const initMerchandiseData = {
  finished: 0,
  total: 0,
  skus: [],
}

@withMobxStorage({
  name: ACTION_STORAGE_KEY_NAMES.SORTING_SCHEDULE_FILTER_TIME,
  selector: [{ storageFilter: ['orderType', 'time_config_id'] }],
})
class Schedule {
  // 非投屏页 搜索条件
  @observable filter = { ...initFilter }

  // 投屏页 搜索条件存入缓存中
  @observable storageFilter = { ...initFilter }
  // 订单数据
  @observable orderData = { ...initOrderData }
  // 商品数据
  @observable merchandiseData = { ...initMerchandiseData }
  // 分拣进度
  @observable schedule = { ...initScheduleData }
  // 是否投屏
  @observable isFullScreen = false
  // 商品分拣进度 显示列数，默认3列，随ui展现模块的宽度改变而改变
  merchandiseShowColumn = 5

  @action
  init() {
    this.orderData = { ...initOrderData }
    this.merchandiseData = { ...initMerchandiseData }
    this.schedule = { ...initScheduleData }
    this.isFullScreen = false
  }

  // 处理传给后台的数据
  @action
  handleFilterParam(obj = {}) {
    const { time_config_id, orderType, target_date } = obj

    const service_time = _.find(
      store.serviceTime,
      (s) => s._id === time_config_id,
    )
    let param = {
      time_config_id: time_config_id,
      target_date: calculateCycleTime(target_date, service_time).begin,
    }
    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      param = {
        ...param,
        order_process_type_id,
      }
    }

    return param
  }

  @action
  fetchData(filter = {}) {
    // 投屏页传filter
    const param = _.isEmpty(filter)
      ? { ...this.handleFilterParam(this.filter) }
      : { ...filter }

    return Request('/weight/weight_collect/weight_info/get')
      .data(param)
      .get()
      .then(
        action((json) => {
          // 非投屏模式下搜索，保存一下搜索条件 给投屏页使用
          if (!this.isFullScreen) {
            this.storageFilter = param
          }
          this.schedule = json.data
        }),
      )
  }

  // 获取订单进度数据
  @action
  getOrderScheduleData(filter = {}, type = null) {
    // 投屏页传filter
    const param = _.isEmpty(filter)
      ? { ...this.handleFilterParam(this.filter) }
      : { ...filter }
    param.random_num = 7

    return Request('/weight/weight_collect/randomorder/list', {
      timeout: 30000,
    })
      .data(param)
      .get()
      .then(
        action((json) => {
          // 点击换一批只用刷新list
          if (type === 'list') {
            this.orderData.orders = json.data.orders
          } else {
            this.orderData = json.data
          }
        }),
      )
  }

  // 获取商品进度数据
  @action
  getMerchandiseScheduleData(filter = {}) {
    // 投屏页传filter
    const param = _.isEmpty(filter)
      ? { ...this.handleFilterParam(this.filter) }
      : { ...filter }
    param.random_num = 15
    return Request('/weight/weight_collect/randomsku/list', { timeout: 30000 })
      .data(param)
      .get()
      .then(
        action((json) => {
          this.merchandiseData = json.data
        }),
      )
  }

  @computed
  get computedMerchandiseDataGroup() {
    const skuList = this.merchandiseData.skus.slice()
    const addList = []
    if (
      skuList.length !== 0 &&
      skuList.length % this.merchandiseShowColumn !== 0
    ) {
      const addLength =
        this.merchandiseShowColumn -
        (skuList.length % this.merchandiseShowColumn)
      for (let i = 0; i < addLength; i++) {
        addList.push({})
      }
    }
    const skuGroup = groupByWithIndex(skuList.concat(addList), (sku, index) =>
      parseInt(index / this.merchandiseShowColumn, 10),
    )
    return _.map(skuGroup, (group) => group)
  }

  @action
  setFilter(field, value) {
    this.filter[field] = value
  }

  @action
  setFilterDate(target_date) {
    this.filter.target_date = target_date
  }

  @action
  setStorageFilterTimeConfig(value) {
    this.storageFilter.time_config_id = value
  }

  @action
  setFullScreen(value) {
    this.isFullScreen = value
  }

  setMerchandiseRef(ref) {
    // 商品分拣进度的宽度
    const merchandiseWidth = findDOMNode(ref).clientWidth
    this.merchandiseShowColumn = parseInt(merchandiseWidth / 300, 10)
  }
}

export default new Schedule()
