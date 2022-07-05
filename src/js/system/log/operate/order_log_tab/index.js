import React from 'react'
import OrderLogFilter from './order_log_filter'
import LogList from '../common/log_list'
import { Request } from '@gm-common/request'
import orderLogStore from '../stores/order_log_store'

class OrderLogTab extends React.Component {
  handleFetch = (paramsFromManagePaginationV2 = {}) => {
    return Request('/station/customized_field/list')
      .data({ deleted: 1 })
      .get()
      .then(function (res) {
        return orderLogStore.getLogList(
          paramsFromManagePaginationV2,
          res.data || [],
        )
      })
  }

  render() {
    return (
      <div>
        <OrderLogFilter orderLogStore={orderLogStore} />
        <LogList
          listData={orderLogStore}
          onRequest={this.handleFetch}
          paginationId='system_log_order_list_pagination'
        />
      </div>
    )
  }
}

export default OrderLogTab
