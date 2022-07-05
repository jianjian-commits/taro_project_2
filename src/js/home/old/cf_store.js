import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import { getNavConfig } from '../../navigation'
import _ from 'lodash'

const navConfig = getNavConfig()

// 一维配置数组
const allConfigMap = {}
_.each(navConfig, (one) => {
  _.each(one.sub, (two) => {
    _.each(two.sub, (there) => {
      allConfigMap[there.link] = there.name
    })
  })
})

class CFStore {
  navConfig = navConfig

  allConfigMap = allConfigMap

  @observable configList = []

  @action
  fetchConfigList() {
    return Request('/home_page/load_config/get')
      .get()
      .then((json) => {
        // 请求配置
        const config = _.filter(
          json.data.load_config,
          (data) => allConfigMap[data]
        )

        // 说出有不一致的路由，同步修正一份数据
        if (
          json.data.load_config &&
          config.length !== json.data.load_config.length
        ) {
          this.postConfigList(config)
        }

        this.configList = config
      })
  }

  @action
  postConfigList(list) {
    const config = list || this.configList
    return Request('/home_page/load_config/set')
      .data({ load_config: JSON.stringify(config) })
      .post()
  }

  @action
  selectedItem(selected) {
    this.configList = selected
  }
}

const cf = new CFStore()

export default cf
