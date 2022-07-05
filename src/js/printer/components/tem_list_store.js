import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

class TemListStore {
  constructor({ mainName }) {
    this.mainName = mainName
  }

  @observable temList = []

  @action.bound
  getTemList() {
    return Request(`/fe/${this.mainName}/list`)
      .get()
      .then((json) => {
        runInAction(() => {
          const list = _.sortBy(json.data, 'create_time')
          this.temList = list
        })
        return json.data
      })
  }

  @action.bound
  setDefaultTem(index) {
    const curTem = this.temList[index]
    const config = {
      id: curTem.id,
      is_default: 1,
    }

    return Request(`/fe/${this.mainName}/edit`)
      .data(config)
      .post()
      .then((json) => {
        return json
      })
  }

  @action.bound
  deleteTem(id) {
    return Request(`/fe/${this.mainName}/delete`)
      .data({
        id,
      })
      .post()
  }
}

export default TemListStore
