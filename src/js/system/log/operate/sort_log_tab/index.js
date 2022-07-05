import React, { Component } from 'react'
import LogList from '../common/log_list'
import sortLogStore from '../stores/sort_log_store'
import SortLogFilter from './sort_log_filter'

class SortLogTab extends Component {
  render() {
    return (
      <div>
        <SortLogFilter sortLogStore={sortLogStore} />
        <LogList
          listData={sortLogStore}
          paginationId='system_log_sort_list_pagination'
        />
      </div>
    )
  }
}

export default SortLogTab
