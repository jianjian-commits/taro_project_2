import React, { useEffect } from 'react'
import QueryFilter from './component/filter'
import OutStockTable from './component/out_stock_table_list'
import store from './store/list_store'
import { i18next } from 'gm-i18n'
import TableListTips from 'common/components/table_list_tips'

import { observer } from 'mobx-react'

const OutStockList = observer((props) => {
  const { in_query, in_query_search_text, outStockList } = store

  useEffect(() => {
    // 返回的时候不重新拉去数据
    if (
      props.location.action !== 'POP' ||
      (props.location.action === 'POP' && outStockList.length === 0)
    ) {
      store.fetchServiceTime().then(() => {
        store.fetchAddressLabelList() // 获取商户标签
        store.fetchAddressRouteList() // 获取线路
        store.fetchOutStockList() // 获取出库列表
      })
    }
  }, [])

  return (
    <>
      <QueryFilter />
      {in_query && (
        <TableListTips
          tips={[
            in_query_search_text +
              i18next.t('不在筛选条件中，已在全部出库单中为您找到'),
          ]}
        />
      )}
      <OutStockTable />
    </>
  )
})

export default OutStockList
