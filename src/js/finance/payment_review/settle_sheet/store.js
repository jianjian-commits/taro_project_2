import { observable, action, computed } from 'mobx'
import { Request } from '@gm-common/request'
import moment from 'moment'
import _ from 'lodash'
import { pinYinFilter } from '@gm-common/tool'

const initFilter = {
  start: new Date(),
  end: new Date(),
  supplySelected: { value: '', name: '' }, // 搜索
  settleInterval: '', // 周期
  statusSelected: '', // 状态筛选
  export: '0',
}

const initPagination = {
  offset: 0,
  limit: 10,
  page_obj: null,
  peek: 60,
  reverse: 0,
}

class Store {
  @observable doFirstRequest = _.noop()

  @observable filter = initFilter

  @observable list = []

  @observable pagination = initPagination

  @observable isSelectAll = false

  @observable selectedList = []

  @observable dataList = []

  @observable loading = false

  @observable supplyGroup = []

  @action
  setDoFirstRequest = (func) => {
    // apiDoFirstRequest有ManagePaginationV2提供
    this.doFirstRequest = func
  }

  @action
  fetchList = (pagination = initPagination) => {
    this.loading = true
    const params = {
      ...this.getFilter,
      ...pagination,
    }

    return Request('/stock/settle_sheet/search')
      .data(params)
      .get()
      .then((res) => {
        this.loading = false
        const { code, data, pagination } = res
        if (code === 0) {
          this.dataList = data
          this.pagination = pagination
          this.selectedList = []
          this.isSelectAll = false
        }
        return res
      })
      .catch(() => {
        this.loading = false
      })
  }

  @action
  mergeFilter = (filter) => {
    Object.assign(this.filter, filter)
  }

  @action
  handleChangeFilter = (name, val) => {
    this.filter[name] = val
  }

  @action
  querySupplierGroup = () => {
    return Request('/stock/settle_supplier/get')
      .get()
      .then((json) => {
        if (json.code === 0) {
          const sGMapping = _.map(json.data, (sg) => {
            return {
              label: sg.name,
              children: _.map(sg.settle_suppliers, (ss) => {
                return {
                  value: ss._id,
                  name: ss.name,
                }
              }),
            }
          })
          this.supplyGroup = sGMapping
        }
      })
  }

  // 批量结款
  @action
  handleBatchPay = (val) => {
    const params = this.isSelectAll
      ? { batch: 2, ...this.getFilter }
      : { batch: 1, ids: JSON.stringify(this.selectedList) }

    return Request('/stock/settle_sheet/pay')
      .data(Object.assign(params, { op: 'pay', running_number: val }))
      .post()
  }

  @action
  handleSelected = (val) => {
    if (val.length !== this.dataList.length) {
      this.isSelectAll = false
    }
    this.selectedList = val
  }

  @action
  handleSelectAll = (bool) => {
    this.isSelectAll = bool
    if (bool)
      this.selectedList = this.dataList
        .filter((f) => f.status === 2 || f.status === 3)
        .map((item) => item.id)
  }

  @action
  handleFilter = (list, query) => {
    if (this.supplySelected && query === this.filter.supplySelected.name)
      return list
    const result = []
    _.each(list, (eList) => {
      const children = pinYinFilter(
        eList.children,
        query,
        (supplier) => supplier.name,
      )

      if (children && children.length > 0) {
        result.push({
          ...eList,
          children,
        })
      }
    })
    return result
  }

  @computed
  get getFilter() {
    const {
      start,
      end,
      supplySelected,
      settleInterval,
      statusSelected,
    } = this.filter
    return {
      start: moment(start).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      status: statusSelected, // 状态筛选
      settle_supplier_id: supplySelected?.value || '', // 搜索供应商
      pay_method: settleInterval, // 结算周期
    }
  }
}

export default new Store()
