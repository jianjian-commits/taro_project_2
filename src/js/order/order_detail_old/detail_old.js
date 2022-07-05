// 暂时应用于移动端，后续废弃
import React from 'react'
import { Loading } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import globalStore from '../../stores/global'

import OrderDetailListOld from './order_detail_list'
import orderDetailStoreOld from './detail_store_old'
import OrderDetailHeaderOld from './order_detail_header'

@observer
class OrderDetailOld extends React.Component {
  componentDidMount() {
    orderDetailStoreOld.get(this.props.location.query.id).then((data) => {
      orderDetailStoreOld.getFreight(data.customer.address_id)
    })
  }

  componentWillUnmount() {
    // 清除订单详情数据
    orderDetailStoreOld.clear()
  }

  render() {
    const orderDetail = toJS(orderDetailStoreOld.orderDetail)
    const orderListImport = toJS(orderDetailStoreOld.orderListImport)
    const isPriceEditable = globalStore.hasPermission('edit_product_unit_price')
    const isQuantityEditable = globalStore.hasPermission('edit_real_quantity')
    const cleanFoodStation = globalStore.otherInfo.cleanFood
    const timeConfig = orderDetail.time_config_info
    const query = this.props.location.query
    const searchSkus = toJS(orderDetailStoreOld.searchSkus)

    if (
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
      <div className='b-order col-md-12'>
        <OrderDetailHeaderOld query={query} orderDetail={orderDetail} />

        <OrderDetailListOld
          order={orderDetail}
          isQuantityEditable={isQuantityEditable}
          cleanFoodStation={cleanFoodStation}
          query={query}
          isPriceEditable={isPriceEditable}
          showOuterId={globalStore.otherInfo.showSkuOuterId}
          orderImport={orderListImport}
          modify
          searchSkus={searchSkus}
        />
      </div>
    )
  }
}

export default OrderDetailOld
