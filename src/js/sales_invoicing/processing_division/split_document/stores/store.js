import { action, computed, observable, runInAction } from 'mobx'
import { createRef } from 'react'
import moment from 'moment'
import { Request } from '@gm-common/request'

export default new (class Store {
  paginationRef = createRef()

  @observable filter = {
    begin: new Date(),
    end: new Date(),
    // -1全部
    status: 0,
    q: '',
  }

  @action mergeFilter = (params) => {
    Object.assign(this.filter, params)
  }

  @computed get searchFilter() {
    const { begin, end, status, q } = this.filter
    const result = {
      q,
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    }
    if (status !== 0) {
      result.status = Number(status)
    }
    return result
  }

  @observable loading = false

  @observable list = []

  @action fetchList = (params) => {
    this.loading = true
    return Request('/stock/split/sheet/list')
      .data(params)
      .get()
      .then((result) => {
        runInAction(() => {
          this.list = result.data.map((item) => {
            const { status, ...rest } = item
            return {
              ...rest,
              status,
              isEditing: false,
              temporaryStatus: status,
            }
          })
        })
        return result
      })
      .finally(() => (this.loading = false))
  }

  @action setListItemData = (index, data) => {
    Object.assign(this.list[index], data)
  }

  @action handleUpdateSplitSheet = (data) => {
    return Request('/stock/split/sheet/update').data(data).post()
  }
})()
