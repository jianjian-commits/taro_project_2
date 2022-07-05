import React from 'react'
import SkuLogFilter from './sku_log_filter'
import LogList from '../common/log_list'
import skuLogStore from '../stores/sku_log_store'

class SkuLogTab extends React.Component {
  render() {
    return (
      <div>
        <SkuLogFilter skuLogStore={skuLogStore} />
        <LogList
          listData={skuLogStore}
          paginationId='system_log_sku_list_pagination'
        />
      </div>
    )
  }
}

export default SkuLogTab
