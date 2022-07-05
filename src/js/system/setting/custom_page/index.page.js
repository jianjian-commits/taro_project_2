import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import { observer } from 'mobx-react'

import { isCStationAndC } from 'common/service'

import ShopSetting from './shop_setting'
import DiyShop from './diy_shop'
import Brand from './brand'
import store from './store/diy_store'
import globalStore from '../../../stores/global'

@observer
class Component extends React.Component {
  componentDidMount() {
    store.getCustomized()
  }

  render() {
    const no_get_shop_decorate =
      !globalStore.hasPermission('get_shop_decorate') || store.data.key === 'gm'

    const tabs = [i18next.t('基础设置'), i18next.t('店铺装修')]
    if (!isCStationAndC()) {
      tabs.push(i18next.t('企业品牌厅'))
    }

    if (no_get_shop_decorate) {
      return <ShopSetting {...this.props} />
    } else {
      return (
        <FullTab tabs={tabs}>
          <ShopSetting {...this.props} />
          <DiyShop {...this.props} />
          {!isCStationAndC() && <Brand {...this.props} />}
        </FullTab>
      )
    }
  }
}

export default Component
