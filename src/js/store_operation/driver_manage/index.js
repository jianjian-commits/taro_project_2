import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import { connect } from 'react-redux'

import DriverControl from './driver_control'
import CarrierManage from './carrier_manage'
import CarManage from './cab_model_manage'
import RouteManage from './route_manage'
import globalStore from 'stores/global'

class DriverManage extends React.Component {
  render() {
    const { isCStation } = globalStore.otherInfo
    const tabs = [i18next.t('司机'), i18next.t('承运商'), i18next.t('车型')]
    if (!isCStation) {
      tabs.push(i18next.t('线路'))
    }

    return (
      <FullTab tabs={tabs}>
        <DriverControl location={this.props.location} />
        <CarrierManage />
        <CarManage />
        {!isCStation && <RouteManage />}
      </FullTab>
    )
  }
}

export default connect((state) => ({
  global: state.global,
}))(DriverManage)
