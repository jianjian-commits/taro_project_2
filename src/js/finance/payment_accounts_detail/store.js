import { i18next } from 'gm-i18n'
import { observable, action } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'
import { sortDirectionChangeToBool } from '../util'
import _ from 'lodash'

const initAccountsDetailDataList = {
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

class AccountsDetailStore {
  @observable searchFilter = {
    ...initSearchFilter,
  }

  @observable sortFilter = {
    ...initSortFilter,
  }

  @observable accountsDetailDataList = []
  @observable accountsDetailSumDataList = {
    ...initAccountsDetailDataList,
  }

  @observable supplierList = []

  @observable isDetail = true

  @action
  setSearchFilter(searchFilter) {
    this.searchFilter = {
      ...searchFilter,
    }
  }

  @action
  setFilterByTotalAccounts(filterData) {
    const { settleSupplier, begin, end } = filterData

    this.searchFilter.settle_supplier_selected = JSON.parse(settleSupplier)
    this.searchFilter = Object.assign({}, this.searchFilter, {
      begin: moment(begin),
      end: moment(end),
    })
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
  clearSearchFilter() {
    this.searchFilter = initSearchFilter
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
  getAccountsDetailList(pagination = {}) {
    const req = {
      ...this.getFilter(),
      ...pagination,
    }

    return Request('/stock/report/settlement/detail')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.accountsDetailDataList = json.data

          return json // 返回给pagination组件获取数据及pagination字段
        }),
      )
  }

  @action
  getAccountsDetailSumList() {
    const req = {
      ...this.getFilter(),
    }

    return Request('/stock/report/settlement/collect')
      .data(req)
      .get()
      .then(
        action((json) => {
          this.accountsDetailSumDataList = json.data

          return json
        }),
      )
  }

  @action
  exportAccountsDetailList() {
    const req = {
      ...this.getFilter(),
    }

    return Request('/stock/report/settlement/export_detail').data(req).get()
  }
}

export default new AccountsDetailStore()
