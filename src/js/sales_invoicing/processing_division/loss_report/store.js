import { action, computed, observable } from 'mobx'
import { createRef } from 'react'
import moment from 'moment'
import { Request } from '@gm-common/request'

export default new (class Store {
  @observable paginationRef = createRef()

  @observable params = {
    begin: new Date(),
    end: new Date(),
    q: '',
    aggregate_by_day: 0,
  }

  @computed get searchParams() {
    const { begin, end, ...rest } = this.params
    return {
      ...rest,
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
    }
  }

  @action mergeParams = (key, value) => {
    this.params[key] = value
  }

  @observable loading = false

  @observable list = []

  /**
   * @type {{source_spu_count:number,split_sheet_count:number}|null}
   */
  @observable totalMsg = null

  @action fetchList = async (params) => {
    this.loading = true
    try {
      const { data: totalMsg } = await Request('/stock/split/loss/count')
        .data(this.searchParams)
        .get()
      this.totalMsg = totalMsg
      const result = await Request('/stock/split/loss/list')
        .data(Object.assign({}, params, this.searchParams))
        .get()
      if (params.export === 1) {
        return
      }
      const { data } = result
      this.list = data
      return result
    } finally {
      this.loading = false
    }
  }
})()
