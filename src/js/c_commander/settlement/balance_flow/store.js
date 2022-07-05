import { action, observable, runInAction } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'

class Store {
  @observable filter = {
    start_time: new Date(),
    end_time: new Date(),
    type: null
  }

  @action mergeFilter = filter => {
    Object.assign(this.filter, filter)
  }

  @observable id = ''
  @observable loading = false

  @observable list = []

  @action
  getRequestFilter() {
    const { start_time, end_time, ...rest } = this.filter
    return {
      start_time: moment(start_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      ...rest
    }
  }

  @action fetchList = (pagination = null, id = null) => {
    this.id = id
    const filter = {
      distributor_id: id,
      export: 0,
      ...this.getRequestFilter(),
      ...pagination
    }
    this.loading = true
    return Request('/community/balance/list')
      .data(filter)
      .get()
      .then(json => {
        runInAction(() => {
          this.list = json.data
        })
        return json
      })
      .finally(() => {
        runInAction(() => {
          this.loading = false
        })
      })
  }

  @action
  setDoFirstRequest(func) {
    this.doFirstRequest = func
  }

  @action
  handleExport() {
    const filter = {
      distributor_id: this.id,
      export: 1,
      ...this.getRequestFilter()
    }

    return Request('/community/balance/list')
      .data(filter)
      .get()
  }
}

export const store = new Store()
