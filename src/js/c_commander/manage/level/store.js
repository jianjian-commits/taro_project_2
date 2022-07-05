import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const initLevel = {
  level_name: '',
  boundary: '',
  scale: ''
}
class Store {
  @observable list = []

  @observable beforeUpdateTarget = [] // 修改前的值

  @observable newLevel = { ...initLevel }

  @action
  initLevel() {
    this.newLevel = { ...initLevel }
  }

  @action
  setNewLevelValue(key, value) {
    this.newLevel[key] = value
  }

  @action
  setApiDoFirstRequest(func) {
    this.apiDoFirstRequest = func
  }

  @action
  createLevel() {
    return Request('/community/level/create')
      .data(this.newLevel)
      .post()
  }

  @action
  fetchList(pagination = null) {
    return Request('/community/level/list')
      .data({ ...pagination })
      .get()
      .then(
        action(json => {
          this.list = _.map(json.data, item => {
            return {
              ...item,
              isEdit: false,
              scale: +item.scale
            }
          })
          return json
        })
      )
  }

  @action
  delLevelById(id) {
    return Request('/community/level/delete')
      .data({ id })
      .post()
  }

  @action
  setValueByIndex(key, index, value) {
    this.list[index][key] = value
  }

  @action
  setIsEditByIndex(index, value) {
    // 保留修改前的值
    this.beforeUpdateTarget = { ...this.list[index] }
    this.list[index].isEdit = value
  }

  @action
  setCancelUpdate(index, bool) {
    this.list[index] = { ...this.beforeUpdateTarget, isEdit: bool }
  }

  @action.bound
  save(data) {
    const filter = {
      id: data.id,
      level_name: data.level_name,
      boundary: data.boundary,
      scale: data.scale
    }
    return Request('/community/level/edit')
      .data(filter)
      .post()
  }
}
export default new Store()
