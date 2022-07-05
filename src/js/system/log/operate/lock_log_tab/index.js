import React, { Component } from 'react'
import LogList from '../common/log_list'
import lockLogStore from '../stores/lock_log_store'
import LockLogFilter from './lock_log_filter'

class LockLogTab extends Component {
  render() {
    return (
      <div>
        <LockLogFilter lockLogStore={lockLogStore} />
        <LogList
          listData={lockLogStore}
          paginationId='system_log_lock_list_pagination'
        />
      </div>
    )
  }
}

export default LockLogTab
