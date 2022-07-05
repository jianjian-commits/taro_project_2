import { observable, action } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'

const initQueryFilter = {
  begin: moment().startOf('day'),
  end: moment().startOf('day'),
  status: 0,
  q: '',
}

class Store {
  @observable queryFilter = {
    ...initQueryFilter,
  }

  @observable list = []

  @action
  changeQueryFilter(name, value) {
    this.queryFilter[name] = value
  }

  @action
  getQueryFilter() {
    const { begin, end, q, status } = this.queryFilter
    const filter = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      q,
    }

    if (+status !== 0) {
      filter.status = status
    }

    return filter
  }

  @action.bound
  fetchInventoryTransferListData(pagination = {}) {
    const req = {
      ...pagination,
      ...this.getQueryFilter(),
    }

    return Request('/stock/inner_transfer_sheet/list')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.list = json.data

          return json // 返回给pagination组件获取数据及pagination字段
        }),
      )
  }

  @action
  exportInventoryTransferListData() {
    const req = {
      ...this.getQueryFilter(),
    }

    return Request('/stock/inner_transfer_sheet/export').data(req).get()
  }
}

export default new Store()
