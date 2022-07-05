import { action, computed, observable, runInAction } from 'mobx'
import moment from 'moment'
import { Request } from '@gm-common/request'

class Store {
  @observable pagination = {
    limit: 10,
    offset: 0,
  }

  @observable setPagination(pagination) {
    this.pagination = pagination
  }

  /**
   * 筛选条件
   * @type {{query_type:number,begin_time:Date,end_time:Date,search_text:string,report_type:number,status:number}}
   */
  @observable filter = {
    query_type: 1,
    begin_time: new Date(),
    end_time: new Date(),
    search_text: '',
    report_type: 6,
    status: null,
  }

  @action setFilter(key, value) {
    this.filter[key] = value
  }

  @computed get trueFilter() {
    const { begin_time, end_time, ...rest } = this.filter
    return {
      begin_time: moment(begin_time).format('YYYY-MM-DD'),
      end_time: moment(end_time).format('YYYY-MM-DD'),
      ...rest,
    }
  }

  @observable list = []

  @action fetchList(filter) {
    return Request('/food_security_report/list')
      .data(filter)
      .get()
      .then(({ data }) => {
        runInAction(() => {
          this.list = data
        })
      })
  }
}

export const store = new Store()
