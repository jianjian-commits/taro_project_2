import React, { useEffect, useMemo } from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'

import store from './store/receipt_store'
import HeaderDetail from './component/header_detail'
import EditTableList from './component/edit_table_list'
import { WithBreadCrumbs } from 'common/service'

const NewStockOutReceipt = () => {
  useEffect(() => {
    const { fetchOutStockTargetList } = store
    fetchOutStockTargetList()
  }, [])

  const { outStockDetail } = store

  const renderList = useMemo(() => {
    const { out_stock_target_type, out_stock_customer } = outStockDetail
    if (out_stock_target_type === 1) {
      return out_stock_customer && <EditTableList type='add' />
    }
    return <EditTableList type='add' />
  }, [outStockDetail.out_stock_customer, outStockDetail.out_stock_target_type])

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[i18next.t('新建出库单')]} />
      <HeaderDetail />
      {renderList}
    </>
  )
}

export default observer(NewStockOutReceipt)
