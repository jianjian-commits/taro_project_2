import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'

const initPage = {
  count: 1,
  offset: 0,
  limit: 10,
}
class Store {
  @observable
  filter = {
    start_date: moment().startOf('days').toDate(),
    end_date: moment().endOf('days').toDate(),
    address_id: '',
    return_status: 0,
    status: 0,
  }

  @observable list = []

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  @observable page = {}

  @observable onFirstRequest = _.noop

  @observable setFirstRequest = (func) => {
    this.onFirstRequest = func
  }

  @action
  changeFilterData = (name, value) => {
    this.filter[name] = value
  }

  @action
  changeListItem(index, name, value) {
    console.log(index, name, value)
    this.list[index][name] = value
  }

  @action
  getSearchData() {
    const { return_status, status, start_date, end_date, ...rest } = this.filter

    const req = {
      ...rest,
      start_date: moment(start_date).format('YYYY-MM-DD'),
      end_date: moment(end_date).format('YYYY-MM-DD'),
    }

    if (return_status !== 0) {
      req.return_status = return_status
    }
    if (status !== 0) {
      req.status = status
    }

    return req
  }

  @action
  fetchList = (page = initPage) => {
    const req = Object.assign({ ...this.getSearchData() }, page)
    return Request('/station/turnover/refund/list')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = _.map(json.data, (item) => {
            return { ...item, refund: Big(item.refund ?? 0).toFixed(2) }
          })
          this.page = page
        })

        return json
      })
  }

  @action
  postData = (req) => {
    return Request('/station/turnover/refund').data(req).post()
  }
}

export default new Store()
