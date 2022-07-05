import React from 'react'
import WeightLogFilter from './weight_log_filter'
import LogList from '../common/log_list'
import weightLogStore from '../stores/weight_log_store'

class WeightLogTab extends React.Component {
  render() {
    return (
      <div>
        <WeightLogFilter weightLogStore={weightLogStore} />
        <LogList
          listData={weightLogStore}
          paginationId='system_log_weight_list_pagination'
        />
      </div>
    )
  }
}

export default WeightLogTab
