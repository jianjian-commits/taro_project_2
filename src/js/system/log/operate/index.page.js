import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import _ from 'lodash'

import OrderLogTab from './order_log_tab'
import SkuLogTab from './sku_log_tab'
import WeightLogTab from './weight_log_tab'
import LockLogTab from './lock_log_tab'
import PurchaseLogTab from './purchase_log_tab'
import SortLogTab from './sort_log_tab'
import StorageLogTab from './storage_log_tab'
import globalStore from 'stores/global'

class Log extends React.Component {
  constructor(props) {
    super(props)
    this.state = { tabKey: 0 }
  }

  handleSelectTab = (tabKey) => {
    this.setState({ tabKey })
  }

  render() {
    const { tabKey } = this.state
    const { isCStation } = globalStore.otherInfo

    let tabs = [
      i18next.t('订单日志'),
      i18next.t('商品日志'),
      i18next.t('分拣日志'),
      i18next.t('锁价日志'),
      i18next.t('采购日志'),
      i18next.t('分类日志'),
      i18next.t('入库日志'),
    ]

    if (isCStation) {
      tabs = _.filter(tabs, (tab) => tab !== i18next.t('锁价日志'))
    }

    return (
      <FullTab active={tabKey} tabs={tabs} onChange={this.handleSelectTab}>
        <OrderLogTab />
        <SkuLogTab />
        <WeightLogTab />
        {!isCStation && <LockLogTab />}
        <PurchaseLogTab />
        <SortLogTab />
        <StorageLogTab />
      </FullTab>
    )
  }
}

export default Log
