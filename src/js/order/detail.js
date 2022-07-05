import React from 'react'
import { i18next } from 'gm-i18n'
import { Loading } from '@gmfe/react'
import _ from 'lodash'
import OrderDetailList from './order_detail/list'
import orderDetailStore from './store'
import { observer } from 'mobx-react'
import globalStore from '../stores/global'
import OrderDetailHeader from './order_detail/header'
import { withBreadcrumbs } from 'common/service'

@withBreadcrumbs([i18next.t('订单详情')])
@observer
class OrderDetail extends React.Component {
  constructor(props) {
    super(props)
    orderDetailStore.clear()
  }

  componentDidMount() {
    globalStore.fetchCustomizedConfigs()
    orderDetailStore.get(this.props.location.query.id).then((data) => {
      orderDetailStore.getFreight(data.customer.address_id)
    })
  }

  render() {
    const { orderDetail, loading } = orderDetailStore
    const isPriceEditable = globalStore.hasPermission('edit_product_unit_price')
    const isQuantityEditable = globalStore.hasPermission('edit_real_quantity')
    const cleanFoodStation = globalStore.otherInfo.cleanFood
    const { time_config_info: timeConfig } = orderDetail
    const query = this.props.location.query

    if (
      loading ||
      !(timeConfig && timeConfig.receive_time_limit) ||
      _.keys(timeConfig.receive_time_limit).length === 0
    ) {
      return (
        <Loading
          style={{
            marginTop: '50px',
          }}
        />
      )
    }

    return (
      <div
        className='b-order col-md-12 gm-order-detail-scoll-auto'
        key='detail'
      >
        <OrderDetailHeader query={query} />

        <OrderDetailList
          isQuantityEditable={isQuantityEditable}
          cleanFoodStation={cleanFoodStation}
          query={query}
          isPriceEditable={isPriceEditable}
          showOuterId={globalStore.otherInfo.showSkuOuterId}
          modify
          style={{ minHeight: '1020px' }}
        />
      </div>
    )
  }
}

export default OrderDetail
