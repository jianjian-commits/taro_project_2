import { observable, action } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const initSelected = {
  value: 0,
  text: '全部供应商',
}

const initQueryFilter = {
  begin: moment().startOf('day'),
  end: moment().startOf('day'),
  selected: {
    ...initSelected,
  },
  q: '',
}

class Store {
  @observable queryFilter = {
    ...initQueryFilter,
  }

  @observable list = []

  @observable supplierList = []

  @observable activeTab = '1'

  @action
  changeQueryFilter(name, value) {
    this.queryFilter[name] = value
  }

  @action
  getQueryFilter() {
    const { begin, end, q, selected } = this.queryFilter
    const filter = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      q,
      type: _.toNumber(this.activeTab),
    }

    if (selected && +selected.value !== 0) {
      filter.supplier_id = selected.value
    }

    return filter
  }

  @action
  fetchSupplierList() {
    return Request('/stock/settle_supplier/get')
      .get()
      .then(
        action((json) => {
          const data = [{ text: '全部供应商', value: '' }]
          _.forEach(json.data[0].settle_suppliers, (v) => {
            data.push({
              value: v.settle_supplier_id,
              text: v.name,
            })
          })

          this.supplierList = data

          return json
        }),
      )
  }

  @action.bound
  fetchInventoryTransferListData(pagination = {}) {
    const req = {
      ...pagination,
      ...this.getQueryFilter(),
    }

    return Request('/stock/inner_transfer_sheet/log/list')
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

    return Request('/stock/inner_transfer_sheet/log/export').data(req).get()
  }

  @action
  changeTab(val) {
    this.activeTab = val
  }

  @action
  clear() {
    this.list = []
    this.queryFilter = {
      ...initQueryFilter,
    }
    this.supplierList = []
  }
}

export default new Store()
