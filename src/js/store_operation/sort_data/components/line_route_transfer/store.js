import { observable, action } from 'mobx'
import { t } from 'gm-i18n'
import { formatRouteList, formatMerchantList } from './utils.js'

import { getRouteLineList, getMerchantList, getCUserList } from './service'

class Store {
  /**
   * route: 路线
   * merchant 商户
   */
  @observable cacheList = { route: [], merchant: [] }

  @observable loading = false

  @action
  async getInitList() {
    this.loading = true
    const [
      { data: routeLineList },
      { data: merchantList },
      { data: cUserList },
    ] = await Promise.all([
      getRouteLineList(),
      getMerchantList(),
      getCUserList(),
    ])

    this.cacheList = {
      route: routeLineList.map(formatRouteList),
      merchant: [
        ...formatMerchantList(merchantList),
        {
          value: '零售客户',
          text: t('零售客户'),
          children: cUserList.map(
            ({ address_id: value, address_name: text }) => ({ value, text }),
          ),
        },
      ],
    }
    this.loading = false
  }
}

export default new Store()
