import React, { Component } from 'react'
import LogList from '../common/log_list'
import PurchaseLogFilter from './purchase_log_filter'
import PurchaseLogStore from '../stores/purchase_log_store'

class PurchaseLogTab extends Component {
  render() {
    return (
      <>
        <PurchaseLogFilter PurchaseLogStore={PurchaseLogStore} />
        <LogList
          listData={PurchaseLogStore}
          paginationId='system_log_purchase_list_pagination'
        />
      </>
    )
  }
}

export default PurchaseLogTab
