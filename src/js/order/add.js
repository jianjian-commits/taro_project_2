import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import OrderDetailList from './order_detail/list'
import orderDetailStore from './store'
import globalStore from '../stores/global'
import OrderDetailHeader from './order_detail/header'

@observer
class OrderAdd extends React.Component {
  constructor(props) {
    super(props)
    orderDetailStore.clear()
    const { repair } = this.props
    orderDetailStore.viewTypeChange('create', repair === true)
  }

  componentDidMount() {
    globalStore.fetchCustomizedConfigs()
  }

  render() {
    const { repair } = this.props
    const { orderDetail, copyData: copy } = orderDetailStore
    const { time_config_info, isCustomerStatusChecking } = orderDetail
    const copyData = copy ? { ...copy } : null
    const isPriceEditable = globalStore.hasPermission('edit_product_unit_price')

    return (
      <div className='b-order col-md-12' key='add'>
        <OrderDetailHeader copyData={copyData} repair={repair === true} />

        {time_config_info && !isCustomerStatusChecking ? (
          <OrderDetailList
            isPriceEditable={isPriceEditable}
            showOuterId={globalStore.otherInfo.showSkuOuterId}
          />
        ) : null}
      </div>
    )
  }
}

OrderAdd.propTypes = {
  repair: PropTypes.bool,
}

export default OrderAdd
