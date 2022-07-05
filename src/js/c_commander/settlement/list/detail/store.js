import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'

class Store {
  @observable filter = {
    dateType: '1', // 搜索类型，1为下单时间，3为收货时间
    begin: new Date(),
    end: new Date(),
    status: '', // 结算状态，1为待结算，2为已结算，''为全部状态
    q: '',
    export: 0
  }

  @observable loading = false
  @observable details = []
  @observable unsettle_money = ''
  @observable total_settle_money = ''

  @action
  setDoFirstRequest(func) {
    this.apiDoFirstRequest = func
  }

  @action
  setValue(key, value) {
    this.filter[key] = value
  }

  @action
  setDateFilterChange(filter) {
    const filterObj = { ...this.filter, ...filter }
    this.filter = filterObj
  }

  @action
  getParams() {
    const { begin, end, dateType, ...rest } = this.filter
    return {
      start_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
      query_type: +dateType,
      ...rest
    }
  }

  @action
  fetchList(pagination, distributor_id) {
    const filter = this.getParams()
    this.loading = true
    return Request('/community/settlement/detail/list')
      .data({
        distributor_id,
        ...filter,
        ...pagination
      })
      .get()
      .then(
        action(json => {
          this.details = json.data
          this.loading = false
          return json
        })
      )
  }

  @action
  fetchNumber(distributor_id) {
    const filter = this.getParams()
    return Request('/community/settlement/detail/count')
      .data({ ...filter, distributor_id })
      .get()
      .then(json => {
        this.unsettle_money = json.data.unsettle_money
        this.total_settle_money = json.data.total_settle_money
      })
  }

  @action
  handleExport(distributor_id) {
    const filter = this.getParams()
    return Request('/community/settlement/detail/list')
      .data({
        ...filter,
        distributor_id,
        export: 1
      })
      .get()
  }
}

export default new Store()
