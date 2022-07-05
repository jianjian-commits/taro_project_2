import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import DriverScheduling from './driver_scheduling'
import DriverTab from './driver_tab'
import OrderTab from './order_tab'
import LineTab from './line_tab'
import globalStore from 'stores/global'

class DistributeOrder extends React.Component {
  constructor() {
    super()
    this.state = {
      tabKey: 0,
      orderTabKey: 0,
    }
  }

  handleSelectTab = (tabKey) => {
    this.setState({ tabKey })
  }

  handleSwitchOrderTabKey(orderTabKey) {
    this.setState({ orderTabKey })
  }

  componentDidMount() {
    globalStore.fetchCustomizedConfigs()
  }

  render() {
    const { tabKey, orderTabKey } = this.state

    // 纯C站点不需要线路任务列表
    const { isCStation } = globalStore.otherInfo
    const tabs = [i18next.t('订单任务列表'), i18next.t('司机任务列表')]
    if (!isCStation) {
      tabs.push(i18next.t('线路任务列表'))
    }

    return (
      <FullTab active={tabKey} tabs={tabs} onChange={this.handleSelectTab}>
        {orderTabKey === 0 ? (
          <OrderTab
            switchOrderTabKey={this.handleSwitchOrderTabKey.bind(this, 1)}
          />
        ) : (
          <DriverScheduling
            switchOrderTabKey={this.handleSwitchOrderTabKey.bind(this, 0)}
          />
        )}
        <DriverTab />
        {!isCStation && <LineTab />}
      </FullTab>
    )
  }
}

export default DistributeOrder
