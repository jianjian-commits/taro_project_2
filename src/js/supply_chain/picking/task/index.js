import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import ViewOrder from './view_order'
import ViewSpu from './view_spu'
import orderStore from './store/store_order'
import globalStore from 'stores/global'

class Picking extends React.Component {
  componentDidMount() {
    orderStore.getDriverList()
    globalStore.fetchCustomizedConfigs()
  }

  render() {
    return (
      <FullTab
        tabs={[i18next.t('按订单查看'), i18next.t('按商品查看')]}
        className='b-order'
      >
        <ViewOrder />
        <ViewSpu />
      </FullTab>
    )
  }
}

export default Picking
