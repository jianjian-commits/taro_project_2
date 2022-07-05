import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'

class Store {
  @observable temList = []

  @action
  getTemList() {
    return Request('/box_template/list')
      .get()
      .then((json) => {
        this.temList = json.data
        return json.data
      })
  }

  @action
  setDefaultTem(index) {
    const curTem = this.temList[index]
    const config = {
      id: curTem.id,
      type: 0,
    }
    return Request('/box_template/update').data(config).post()
  }

  @action
  deleteTem(id) {
    return Request('/box_template/delete').data({ id }).post()
  }
}

export default new Store()
