import { action, observable } from 'mobx'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const initFilter = {
  routerSelected: { text: i18next.t('全部线路'), value: null },
  q: '',
}
class Store {
  @observable filter = { ...initFilter }

  @observable prioritySuppliers = []

  @observable isSelectAllPage = false

  @observable selectedRecord = []

  @action
  editColumn(index, obj) {
    const list = this.prioritySuppliers.slice()
    const target = list[index]
    list[index] = {
      ...target,
      ...obj,
    }
    this.prioritySuppliers = list
  }

  @action
  clear() {
    this.filter = { ...initFilter }
    this.prioritySuppliers = []
    this.isSelectAllPage = false
    this.selectedRecord = []
  }

  @action
  setFilter(key, value) {
    this.filter = { ...this.filter, [key]: value }
  }

  @action
  getPrioritySuppliers(params) {
    const { routerSelected } = this.filter
    return Request('/supplier/priority_supplier/list')
      .data({
        ...params,
        route_id: routerSelected ? routerSelected.value : null,
        q: this.filter.q,
      })
      .get()
      .then((json) => {
        this.prioritySuppliers = json.data
        this.isSelectAllPage = false
        this.selectedRecord = []
        return json
      })
  }

  @action
  exportXlsx = (params) => {
    const { routerSelected } = this.filter
    return Request('/supplier/priority_supplier/export')
      .data({
        ...params,
        route_id: routerSelected ? routerSelected.value : null,
        q: this.filter.q,
      })
      .get()
  }

  @action
  toggleSelectAll(isSelectedAll) {
    if (isSelectedAll) {
      this.selectedRecord = _.map(this.prioritySuppliers.slice(), (v) => v.id)
    } else {
      this.selectedRecord.clear()
    }
  }

  @action
  toggleIsSelectAllPage(bool) {
    this.isSelectAllPage = bool
    if (bool) {
      this.selectedRecord = _.map(this.prioritySuppliers.slice(), (v) => v.id)
    }
  }

  @action
  setSelect(selected) {
    if (
      this.isSelectAllPage &&
      selected.length !== this.prioritySuppliers.length
    ) {
      this.isSelectAllPage = false
    }

    this.selectedRecord = selected
  }
}

export default new Store()
