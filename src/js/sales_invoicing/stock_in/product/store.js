import { action, observable } from 'mobx'

class Store {
  @observable activeTab = 0

  @action changeTab = (tab) => {
    this.activeTab = tab
  }
}

export default new Store()
