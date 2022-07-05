import React, { useEffect } from 'react'
import QueryFilter from './component/filter'
import OutStockTable from './component/out_stock_table_list'
import store from './store/list_store'

import { observer } from 'mobx-react'

const OutStockList = observer((props) => {
  useEffect(() => {
    store.fetchServiceTime().then(() => {
      store.fetchSorterList() // 获取分拣员
      store.fetchAddressLabelList() // 获取商户标签
      store.fetchAddressRouteList() // 获取线路
      store.fetchOutStockList() // 获取出库列表
      store.getServiceTime() // 获取运营时间
    })
  }, [])

  return (
    <>
      <QueryFilter />
      <OutStockTable />
    </>
  )
})

export default OutStockList
