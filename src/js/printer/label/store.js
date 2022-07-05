import { action, runInAction, observable } from 'mobx'
import { Request } from '@gm-common/request'

class LabelListStore {
  @observable temList = []

  @action.bound
  getTemList() {
    return Request('/station/print_tag/list')
      .get()
      .then((json) => {
        runInAction(() => {
          this.temList = json.data.result_list
        })
        return json.data
      })
  }

  @action.bound
  setDefaultTem(index) {
    const curTem = this.temList[index]
    const config = {
      id: curTem.id,
      default: 1,
    }

    return Request('/station/print_tag/edit').data(config).post()
  }

  @action.bound
  deleteTem(id) {
    return Request('/station/print_tag/delete').data({ id }).post()
  }
}

export default new LabelListStore()
