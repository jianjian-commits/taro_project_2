import { observable, action } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { requestTodoData, requestBriefData } from './service'
// import { Storage } from '@gm-common/tool'
class Store {
  constructor() {
    // this.vision = Storage.get('vision')
    this.fetchFns = ['fetchTodoData', 'fetchSaleTrend']
  }

  @observable
  filter = {
    begin_time: moment().subtract('30', 'days'),
    end_time: moment(),
    type: 'order_time',
    searchText: '',
  }

  @observable
  vision = 'new'

  @action
  setVision(type) {
    this.vision = type
  }

  @action
  setFilter(filter) {
    for (const key in filter) {
      this.filter[key] = filter[key]
    }
  }

  getParams(filter) {
    const common = {
      time_range: [
        {
          begin_time: this.filter.begin_time,
          end_time: this.filter.end_time,
          time_field: this.filter.type,
        },
      ],
      query_expr: {
        filter: [],
        group_by_fields: [],
        order_by_fields: [],
      },
    }

    return _.merge(common, filter)
  }

  fetchAllData() {
    this.fetchFns.forEach((key) => {
      this[key](...arguments)
    })
  }

  // -----  待处理事项 ------
  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable
  todoData = {}

  @action
  fetchTodoData = (params = {}) => {
    // 订单的数据从旧接口中获取
    const time_range = [
      {
        begin_time: moment().subtract('7', 'days'),
        end_time: this.filter.end_time,
        time_field: this.filter.type,
      },
    ]
    requestTodoData(this.getParams(), time_range).then((data) => {
      this.todoData = data
    })
  }

  // -----  今日简报 ------
  @observable
  briefData = []

  @action
  fetchSaleTrend() {
    console.log(this.getParams())
    requestBriefData(this.getParams()).then((data) => {
      const today = moment().format('YYYY-MM-DD')
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')

      data.forEach((item) => {
        item.data.forEach((f) => {
          if (moment(f.xAxis).format('YYYY-MM-DD') === today)
            item.value = f.yAxis
          if (moment(f.xAxis).format('YYYY-MM-DD') === yesterday)
            item.preValue = f.yAxis
        })
      })

      this.briefData = data
    })
  }
}

export default new Store()
