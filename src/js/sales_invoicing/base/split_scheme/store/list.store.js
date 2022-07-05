import { createRef } from 'react'
import { action, observable, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

export default new (class Store {
  paginationRef = createRef()

  @observable filter = {
    q: '',
  }

  @action mergeFilter = (value, key) => {
    Object.assign(this.filter, { [key]: value })
  }

  @observable list = []

  @observable loading = false

  @action fetchList = (params) => {
    this.loading = true
    return Request('/stock/split/plan/list')
      .data(params)
      .get()
      .then((result) => {
        runInAction(() => {
          this.list = result.data
        })
        return result
      })
      .finally(() => (this.loading = false))
  }

  @action handleDelete = (params) => {
    return Request('/stock/split/plan/delete').data(params).post()
  }
})()
