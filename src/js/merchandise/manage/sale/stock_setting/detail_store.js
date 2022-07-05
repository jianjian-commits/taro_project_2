import { observable, action, runInAction, computed } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'

const date = moment().startOf('day')
class StockSettingDetailStore {
  @observable filter = {
    begin: date,
    end: date,
  }

  @observable list = []

  @observable pagination = { offset: 0, limit: 10 }

  @action
  changeFilter(name, value) {
    this.filter[name] = value
  }

  @computed
  get searchData() {
    const { begin, end } = this.filter
    return {
      start_time: moment(begin).format('YYYY-MM-DD'),
      end_time: moment(end).format('YYYY-MM-DD'),
      offset: this.pagination.offset,
      limit: this.pagination.limit,
    }
  }

  @action
  getList(params, id) {
    const req = Object.assign({}, params, { sku_id: id })
    Request('/product/stocks/flow')
      .data(req)
      .get()
      .then((json) => {
        runInAction(() => {
          this.list = json.data
          this.pagination = json.pagination
        })
      })
  }

  @action
  changePage(page) {
    this.pagination = page
  }
}

export default new StockSettingDetailStore()
