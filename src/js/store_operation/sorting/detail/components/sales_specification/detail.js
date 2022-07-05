import React from 'react'
import { observer } from 'mobx-react'
import HeaderDetail from './component/header_detail'
import DetailTableList from './component/detail_table_list'
import { i18next } from 'gm-i18n'
import { WithBreadCrumbs } from 'common/service'
import store from './store/receipt_store'
import EditTableList from './component/edit_table_list'

const OutStockReceiptDetail = observer(() => {
  const {
    outStockDetail: { status, is_bind_order },
  } = store

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[i18next.t('出库单详情')]} />
      <HeaderDetail />
      {status === 1 && !is_bind_order ? (
        <EditTableList type='detail' />
      ) : (
        <DetailTableList type='detail' />
      )}
    </>
  )
})

export default OutStockReceiptDetail
