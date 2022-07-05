import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  @observable list = []

  @action
  init() {
    Request('/purchase/task/settle_suppliers')
      .get()
      .then((json) => {
        const list = json.data
        runInAction(() => {
          this.list = list
        })
      })
  }
}

export default new Store()
