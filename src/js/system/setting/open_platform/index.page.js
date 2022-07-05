import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import ErrorList from './error_list'
import PlatformList from './platform_list'
import globalStore from '../../../stores/global'

class Component extends React.Component {
  render() {
    const isShowFailList = globalStore.hasPermission('get_msg_fail_list')
    const tabs = isShowFailList
      ? [i18next.t('平台管理'), i18next.t('失败列表')]
      : [i18next.t('平台管理')]
    return (
      <FullTab tabs={tabs}>
        <PlatformList {...this.props} />
        {isShowFailList ? <ErrorList {...this.props} /> : null}
      </FullTab>
    )
  }
}

export default Component
