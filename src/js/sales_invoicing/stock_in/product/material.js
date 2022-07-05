import React, { useEffect } from 'react'
import QueryFilter from './component/query_filter'
import StockInListTable from './component/stock_in_list_table'
import { t } from 'gm-i18n'
import store from './store/list_store'
import TableListTips from 'common/components/table_list_tips'
import { observer } from 'mobx-react'

const StockInList = observer((props) => {
  const { in_query, in_query_search_text } = store

  // componentWillMount中清理数据过后需要setTimeout才能拿到新的props
  useEffect(() => {
    // 从其他页面进入，清理数据
    if (props.location.action === 'REPLACE') {
      store.clear()
    }
    const { list } = store
    setTimeout(() => {
      // 返回的时候不搜索数据
      if (
        list &&
        (props.location.action !== 'POP' ||
          (props.location.action === 'POP' && !list.length))
      ) {
        store.apiDoFirstRequest()
      }
    }, 0)
  }, [props.location])

  return (
    <>
      <QueryFilter />
      {in_query && (
        <TableListTips
          tips={[
            in_query_search_text +
              t('不在筛选条件中，已在全部入库单中为您找到'),
          ]}
        />
      )}
      <StockInListTable />
    </>
  )
})

export default StockInList
