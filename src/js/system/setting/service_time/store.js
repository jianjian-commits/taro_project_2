import { Tip } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import { preProcessState, processState } from './util'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const initState = {
  id: null,
  name: '',
  desc: '',
  final_distribute_time: '06:00',
  final_distribute_time_span: 1,
  order_time_limit: {
    e_span_time: 0,
    start: '06:00',
    end: '23:00',
  },
  receive_time_limit: {
    e_span_time: 1,
    end: '12:00',
    s_span_time: 1,
    start: '06:00',
    receiveTimeSpan: '15',
  },
  // 不配送时间设置
  is_undelivery: 0,
  undelivery_times: [{ start: null, end: null }],
}

const preInitState = {
  id: null,
  name: '',
  desc: '',
  type: 2,
  final_distribute_time: '06:00',
  final_distribute_time_span: 0,
  order_time_limit: {
    e_span_time: 0,
    start: '06:00',
    end: '23:00',
  },
  receive_time_limit: {
    e_span_time: 1, // 用户可选最晚收货日期
    s_span_time: 1, // 用户可选最早收货日期
    start: '06:00', // 每天收货时间开始
    receiveEndSpan: 0, // 每天收货时间范围
    end: '12:00', // 每天收货时间范围
    receiveTimeSpan: '15', // 收货间隔
    weekdays: 127,
  },
  // 不配送时间设置
  is_undelivery: 0,
  undelivery_times: [{ start: null, end: null }],
}

// 普通，预售数据修正校验算法不同
const smm_common_change = (state, action, type = 'smm') => {
  state = Object.assign({}, state)
  const names = action.name.split('.')
  if (names.length === 1) {
    state[names[0]] = action.value
  } else {
    state[names[0]][names[1]] = action.value
  }
  if (type === 'smm') {
    return processState(state)
  } else {
    // 'pre_smm'
    return preProcessState(state)
  }
}

class Store {
  @observable list = []

  @observable smm = Object.assign({}, initState)

  @observable smmPre = Object.assign({}, preInitState)

  @action
  clear() {
    this.smm = Object.assign({}, initState)
    this.smmPre = Object.assign({}, preInitState)
  }

  @action
  getSmmList() {
    return Request('/service_time/list')
      .data({
        details: 0,
      })
      .get()
      .then(
        action((json) => {
          this.list = json.data || []
        }),
      )
  }

  @action
  getServiceTimeInfo(id, isPre) {
    Request('/service_time/get')
      .data({ id })
      .get()
      .then(
        action((json) => {
          const { undelivery_times } = json.data
          const _undelivery_times =
            undelivery_times && undelivery_times.length
              ? undelivery_times
              : [{ start: null, end: null }]

          if (isPre) {
            this.smmPre = Object.assign({}, this.smmPre, {
              ...json.data,
              id: json.data._id,
              undelivery_times: _undelivery_times,
            })
          } else {
            this.smm = Object.assign({}, this.smm, {
              ...json.data,
              id: json.data._id,
              undelivery_times: _undelivery_times,
            })
          }
        }),
      )
  }

  @action
  smmChange(name, value) {
    this.smm = smm_common_change(this.smm, { name, value })
  }

  @action
  smmSave(smm) {
    const undelivery_times = _.filter(
      smm.undelivery_times,
      (t) => t.start && t.end,
    )

    const data = Object.assign({}, smm, {
      is_undelivery: Number(smm.is_undelivery),
      order_time_limit: JSON.stringify(smm.order_time_limit),
      receive_time_limit: JSON.stringify(smm.receive_time_limit),
      undelivery_times: JSON.stringify(undelivery_times),
    })
    if (!data.id) {
      delete data.id
    }
    return Request('/service_time/save').data(data).post()
  }

  @action
  smmPreChange(name, value) {
    this.smmPre = smm_common_change(this.smmPre, { name, value }, 'pre_smm')
  }

  @action
  deleteServiceTime(id) {
    return Request('/station/service_time/delete')
      .data({ id })
      .post()
      .then((json) => {
        Tip.success(i18next.t('删除成功'))
      })
  }

  @action
  selectReceiveDays(selected) {
    let weekdays = 0
    const state = this.smmPre
    _.forEach(selected, (item) => {
      weekdays += item.value
    })
    this.smmPre = Object.assign({}, state, {
      receive_time_limit: Object.assign({}, state.receive_time_limit, {
        weekdays,
      }),
    })
  }
}

export default new Store()
