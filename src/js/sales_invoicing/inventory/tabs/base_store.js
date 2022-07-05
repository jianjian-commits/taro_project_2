import { action, observable, runInAction } from 'mobx'
import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { RightSideModal } from '@gmfe/react'
import TaskList from '../../../task/task_list'

const initFilter = {
  begin: moment(new Date()).format('YYYY-MM-DD'),
  end: moment(new Date()).format('YYYY-MM-DD'),
  text: '',
  category_id_1: '',
  category_id_2: '',
  settle_supplier_id: '',
  time_type: 1,
  find_type: 1,
}

export class BaseStore {
  @observable pagination

  @observable filter = {
    begin: moment(new Date()).format('YYYY-MM-DD'),
    end: moment(new Date()).format('YYYY-MM-DD'),
    text: '',
    category_id_1: '',
    category_id_2: '',
    settle_supplier_id: '',
    time_type: 1,
    find_type: 1,
  }

  @action setFilter = (filter) => {
    this.filter = filter
  }

  @action initFilter = () => {
    const changeInitFilter = {}
    for (const key in initFilter) {
      const value = this.filter[key]
      if (value) {
        changeInitFilter[key] = initFilter[key]
      }
    }
    this.filter = { ...this.filter, ...changeInitFilter }
  }

  @observable list = []

  @observable loading = false

  // 老的明细查询接口，弃用
  @action fetchList = async (filter, url) => {
    this.loading = true
    try {
      const result = await Request(url).data(filter).get()
      runInAction(() => {
        const { data, pagination } = result
        this.list = data
        this.pagination = pagination
      })
      return result
    } finally {
      this.loading = false
    }
  }

  // 入库明细查询拆分成两个接口
  @action fetchListApart = async (filter, url, urlForCunt) => {
    this.loading = true
    try {
      const result = await Request(url).data(filter).get()
      // 单独查询总数count

      const pageCount = await Request(urlForCunt)
        .data(_.omit(filter, ['limit', 'offset']))
        .get()
      const count = pageCount.data.count
      runInAction(() => {
        const { data, pagination } = result
        this.list = data
        this.pagination = { ...pagination, count }
      })
      // 设置result的count，才能显示页码切换，-1时不显示
      if (count !== -1) result.pagination.count = count
      return result
    } finally {
      this.loading = false
    }
  }

  @action exportAsync = (filter, url) => {
    return Request(url)
      .data(filter)
      .get()
      .then((json) => {
        if (json.code === 0) {
          RightSideModal.render({
            children: <TaskList />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        }
      })
  }
}
