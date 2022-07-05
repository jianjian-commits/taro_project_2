import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip } from '@gmfe/react'
import { FullTab } from '@gmfe/frame'
import globalStore from 'stores/global'

import ViewOrder from './view_order'
import ViewSku from './view_sku'

class OrderList extends React.Component {
  constructor(props) {
    super(props)

    const date = new Date()
    this.state = {
      begin: date,
      end: date,
    }
  }

  componentDidMount() {
    globalStore.fetchCustomizedConfigs()
  }

  componentWillUnmount() {
    // 只有在订单列表页才显示任务列表Tip
    Tip.clearAll()
  }

  render() {
    return (
      <FullTab
        tabs={[i18next.t('按订单查看'), i18next.t('按商品查看')]}
        className='b-order'
      >
        <ViewOrder {...this.props} />
        <ViewSku {...this.props} />
      </FullTab>
    )
  }
}

export default OrderList
