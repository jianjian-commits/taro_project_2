import { action, observable } from 'mobx'
import { getStaticStorage } from 'gm_static_storage'

class GlobalStaticResourceStore {
  @observable domainName = []

  @action
  fetchData() {
    getStaticStorage(`/common/domain_name.json`).then(
      action((json) => {
        this.domainName = json
      })
    )
  }
}

export default new GlobalStaticResourceStore()
