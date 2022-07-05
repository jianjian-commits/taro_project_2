import { action, observable } from 'mobx'
import { Request } from '@gm-common/request'

class Sorting {
  // 运营周期
  @observable serviceTime = []

  // 获取运营时间
  getServiceTime() {
    return Request('/service_time/list')
      .get()
      .then(
        action((json) => {
          this.serviceTime = json.data
          return json.data
        }),
      )
  }
}

export default new Sorting()
