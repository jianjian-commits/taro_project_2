import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import PurchaseOverView from './purchase_overview/purchase_overview'
import PurchaserPerformance from './purchaser_rank/purchaser_performance'

class Component extends React.Component {
  render() {
    const { activeTab } = this.props.location.query

    return (
      <FullTab
        active={+activeTab || 0}
        tabs={[i18next.t('采购总览'), i18next.t('采购员绩效')]}
        className='b-order'
      >
        <PurchaseOverView />
        <PurchaserPerformance />
      </FullTab>
    )
  }
}

export default Component
