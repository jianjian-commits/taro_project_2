// 暂时应用于移动端，后续废弃
import React from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import PropTypes from 'prop-types'

import globalStore from '../../stores/global'

import OrderDetailHeaderOld from './order_detail_header'
import OrderDetailListOld from './order_detail_list'
import OrderDetailStoreOld from './detail_store_old'

@observer
class OrderAddOld extends React.Component {
  async componentWillMount() {
    const { repair } = this.props

    await OrderDetailStoreOld.viewTypeChange('create', repair)
  }

  componentWillUnmount() {
    OrderDetailStoreOld.clear()
  }

  render() {
    const { repair } = this.props
    const searchSkus = toJS(OrderDetailStoreOld.searchSkus)
    const orderDetail = toJS(OrderDetailStoreOld.orderDetail)
    const orderListImport = toJS(OrderDetailStoreOld.orderListImport)
    const { time_config_info } = orderDetail
    const isPriceEditable = globalStore.hasPermission('edit_product_unit_price')
    return (
      <div className='b-order col-md-12'>
        <OrderDetailHeaderOld orderDetail={orderDetail} repair={repair} />

        {time_config_info ? (
          <OrderDetailListOld
            order={orderDetail}
            isPriceEditable={isPriceEditable}
            showOuterId={globalStore.otherInfo.showSkuOuterId}
            orderImport={orderListImport}
            searchSkus={searchSkus}
          />
        ) : null}
      </div>
    )
  }
}

OrderAddOld.propTypes = {
  repair: PropTypes.bool,
}

export default OrderAddOld
