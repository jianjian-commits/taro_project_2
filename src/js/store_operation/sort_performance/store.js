import React from 'react'
import { observable, action } from 'mobx'
import moment from 'moment'
import { RightSideModal } from '@gmfe/react'

import TaskList from '../../task/task_list'

import { getPerformanceList, exportList } from './service'
const INIT_FILTERRULES = {
  start_date: moment().startOf('date').format('YYYY-MM-DD'),
  end_date: moment().endOf('date').format('YYYY-MM-DD'),
}
class Store {
  @observable filterRules = {
    ...INIT_FILTERRULES,
  }

  @observable data = {
    salaries: [],
  }

  @observable loading = false

  @observable selected = []
  // 打印选项
  @observable printType = 1
  @action
  getSorterList(pagination = {}) {
    this.loading = true
    getPerformanceList({ ...this.filterRules }).then((json) => {
      this.loading = false
      const { data } = json
      this.data = data
    })
  }

  @action
  exportList(user_id) {
    exportList({ ...this.filterRules, user_id }).then((res) => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  @action
  filterChange(obj) {
    this.filterRules = {
      ...this.filterRules,
      ...obj,
    }
  }

  @action
  onSelect(selected) {
    this.selected = selected
  }

  @action
  selectAllPage(isSelectAll) {
    this.selected = isSelectAll
      ? this.data.salaries.map(({ user_id }) => user_id)
      : []
  }

  @action
  clearSelect() {
    this.selected = []
  }

  @action
  clearStore() {
    this.filterRules = {
      ...INIT_FILTERRULES,
    }
    this.data = {
      salaries: [],
    }
    this.loading = false
    this.selected = []
    this.printType = 1
  }
}

export default new Store()
