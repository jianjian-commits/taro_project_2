import { action, observable } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { System } from '../../../../../common/service'

const initFilter = {
  routerSelected: { text: i18next.t('全部线路'), value: null },
  q: '',
}
class Store {
  @observable filter = { ...initFilter }

  @observable isSelectAllPage = false

  @observable suppliers = []

  @observable selectedRecord = []

  @observable selectAllType = 1

  @action
  clear() {
    this.filter = { ...initFilter }
    this.isSelectAllPage = false
    this.suppliers = []
    this.selectedRecord = []
  }

  @action
  editColumn(index, obj) {
    const list = this.suppliers.slice()
    const target = list[index]
    list[index] = {
      ...target,
      ...obj,
    }
    this.suppliers = list
  }

  @action
  setFilter(key, value) {
    this.filter = { ...this.filter, [key]: value }
  }

  @action
  getSuppliersBySku(params) {
    const { routerSelected, q } = this.filter
    return Request('/supplier/priority_supplier/all_type/list')
      .data({
        ...params,
        route_id: routerSelected ? routerSelected.value : null,
        q,
      })
      .get()
      .then(
        action((json) => {
          this.suppliers = json.data
          this.isSelectAllPage = false
          this.selectedRecord = []
          return json
        })
      )
  }

  @action
  setAllTypeByBatch(params, updateOne = false) {
    if (System.isC()) params.is_retail_interface = 1
    return Request('/supplier/priority_supplier/all_type/batch_set')
      .data(params)
      .post()
  }

  @action
  deleteByBatch(params) {
    return Request('/supplier/priority_supplier/delete').data(params).post()
  }

  @action
  toggleSelectAll(isSelectedAll) {
    if (isSelectedAll) {
      this.selectedRecord = _.map(this.suppliers.slice(), (v) => v.address_id)
    } else {
      this.selectedRecord.clear()
    }
  }

  @action
  toggleIsSelectAllPage(bool) {
    this.isSelectAllPage = bool
    if (bool) {
      this.selectedRecord = _.map(this.suppliers.slice(), (v) => v.address_id)
    }
  }

  @action
  setSelect(selected) {
    if (this.isSelectAllPage && selected.length !== this.suppliers.length) {
      this.isSelectAllPage = false
    }

    this.selectedRecord = selected
  }
}

export default new Store()
