import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { sortDirectionChangeToBool } from '../util'
import _ from 'lodash'

const initTotalSumDataList = {
  early_unpay_sum: '',
  cur_should_pay_sum: '',
  cur_pay_sum: '',
  total_unpay_sum: '',
}

const initSupplierSelected = { text: i18next.t('全部供应商'), value: '' }

const initSearchFilter = {
  begin: moment().startOf('day'),
  end: moment().startOf('day'),
  settleInterval: '',
  settle_supplier_selected: initSupplierSelected,
}

const initSortFilter = {
  sort_column: null,
  sort_direction: null,
}

class TotalAccountsStore {
  @observable searchFilter = {
    ...initSearchFilter,
  }

  @observable sortFilter = {
    ...initSortFilter,
  }

  @observable totalDataList = []
  @observable totalSumDataList = {
    ...initTotalSumDataList,
  }

  @observable supplierList = []

  @action
  clearSearchFilter() {
    this.searchFilter = initSearchFilter
  }

  @action
  setSearchFilter(searchFilter) {
    this.searchFilter = {
      ...searchFilter,
    }
  }

  @action.bound
  changeSearchFilter(name, value) {
    this.searchFilter[name] = value
  }

  @action
  changeSortFilter(columnName, direction) {
    this.sortFilter = {
      sort_direction: direction,
      sort_column: columnName,
    }
  }

  @action.bound
  selectSupplier(selected) {
    this.searchFilter.settle_supplier_selected = selected
  }

  @action
  getFilter() {
    const { begin, end, settleInterval } = this.searchFilter
    const { sort_direction, sort_column } = this.sortFilter
    let req = {
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      pay_method: settleInterval,
    }

    if (sort_column) {
      req = Object.assign({}, req, {
        sort_column,
        sort_direction: sortDirectionChangeToBool(sort_direction),
      })
    }

    req.settle_supplier_id = this.searchFilter.settle_supplier_selected
      ? this.searchFilter.settle_supplier_selected.value
      : ''

    return req
  }

  @action
  getSupplierList() {
    return Request('/stock/settle_supplier/get')
      .get()
      .then(
        action((json) => {
          const data = [{ text: i18next.t('全部供应商'), value: '' }]
          _.forEach(json.data[0].settle_suppliers, (v) => {
            data.push({
              value: v.settle_supplier_id,
              text: `${v.name}(${v.customer_id})`,
            })
          })

          this.supplierList = data

          return json
        }),
      )
  }

  @action.bound
  getTotalAccountsList(pagination = {}) {
    const req = {
      ...this.getFilter(),
      ...pagination,
    }

    return Request('/stock/report/settlement/list')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.totalDataList = json.data

          return json // 返回给pagination组件获取数据及pagination字段
        }),
      )
  }

  @action
  getTotalSumAccountsList() {
    const req = {
      ...this.getFilter(),
    }

    return Request('/stock/report/settlement/collect')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.totalSumDataList = json.data

          return json
        }),
      )
  }
}

export default new TotalAccountsStore()
