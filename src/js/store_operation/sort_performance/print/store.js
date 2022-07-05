import { observable, action } from 'mobx'

import { getDetails } from './service'
import { formatPostData } from 'common/util'
class Store {
  @observable salaries = []

  @action
  getDetails(params) {
    getDetails(formatPostData(params)).then((res) => {
      if (res?.code === 0) {
        const {
          data: { start_date, end_date, salaries },
        } = res
        this.salaries = salaries.map((data) => ({
          ...data,
          statistical_date: `${start_date}-${end_date}`,
        }))
      }
    })
  }
}

export default new Store()
