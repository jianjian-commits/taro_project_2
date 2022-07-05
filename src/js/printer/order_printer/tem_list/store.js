import { observable, action, runInAction } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

class TemListStore {
  @observable temList = []

  @action
  getTemList() {
    return Request('/station/distribute_config/list')
      .data({ category: 1 })
      .get()
      .then((json) => {
        runInAction(() => {
          const list = _.sortBy(json.data, 'create_time')
          this.temList.replace(list)
        })
        return json.data
      })
  }

  @action.bound
  setDefaultTem(index, category) {
    const curTem = this.temList[index]
    const config = {
      id: curTem.id,
      content: JSON.stringify(curTem.content),
      is_default: 1,
      category,
    }

    return Request('/station/distribute_config/edit_new')
      .data(config)
      .post()
      .then((json) => {
        return json
      })
  }

  @action
  deleteTem(id, category) {
    // 在模板绑定了商户的情况下，如果 is_force == 0，后台会返回code==1 “删除后此模板的商户将分配到默认模板，确定删除吗？”；
    // 如果 is_force == 1，后台会把此模板的商户将分配到默认模板
    return Request('/station/distribute_config/delete_new')
      .data({
        id,
        is_force: 1,
        category,
      })
      .post()
  }
}

export default new TemListStore()
