import { observable, action } from 'mobx'
import { DBActionStorage, withMobxStorage } from 'gm-service/src/action_storage'
import _ from 'lodash'

// 使用 localstorage 的字段记得写到这里
const SELECTOR = ['tpl_id', 'hidePrinterOptionsModal']

class TplStore {
  constructor(name, selector) {
    this.name = name
    this.selector = selector
  }

  @observable tpl_id = null
  @observable hidePrinterOptionsModal = false

  // 同步一下localStorage的数据(比如浏览器新开一个tab,改了数据,调用一下这个方法,同步到当前tab的Mobx实例中)
  @action.bound
  syncObservableFromLocalstorage() {
    const storage = DBActionStorage.get(this.name)
    if (storage) {
      this.selector.forEach((key) => {
        this[key] = storage[key]
      })
    }
  }

  @action.bound
  setObservable(key, value) {
    this[key] = value
  }

  @action.bound
  checkTplId(temList) {
    const isOk = _.find(temList, (o) => o.id === this.tpl_id)
    if (!isOk) {
      this.tpl_id = temList[0]?.id
    }
  }
}

export default (name) => {
  const Store = withMobxStorage({
    name: name,
    selector: SELECTOR,
  })(TplStore)

  return new Store(name, SELECTOR)
}
