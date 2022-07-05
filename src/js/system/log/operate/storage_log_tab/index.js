import React, { Component } from 'react'
import LogList from '../common/log_list'
import StorageLogFilter from './storage_log_filter'
import StorageLogStore from '../stores/storage_log_store'

class StorageLogTab extends Component {
  render() {
    return (
      <>
        <StorageLogFilter StorageLogStore={StorageLogStore} />
        <LogList
          listData={StorageLogStore}
          paginationId='system_log_purchase_list_pagination'
        />
      </>
    )
  }
}

export default StorageLogTab
