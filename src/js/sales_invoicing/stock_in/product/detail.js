import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import HeaderDetail from './component/header_detail'
import store from './store/receipt_store'
import StockInDetailWarning from './component/stock_in_detail_warning'
import StockInListDetail from './component/stock_in_list_detail'
import StockInSharePanel from './component/stock_in_share_panel'
import StockInDiscountEditDetail from './component/stock_in_discount_edit_detail'
import { t } from 'gm-i18n'
import { WithBreadCrumbs } from 'common/service'

const StockInReceiptCreate = observer((props) => {
  useEffect(() => {
    store.setReceiptId(props.location.query.id)
    store.fetchStockInReceiptList()
    store.fetchGetShowRefCostType()
  }, [props.location.query.id])

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('入库单详情')]} />
      <HeaderDetail type='detail' />
      <StockInDetailWarning />
      <StockInListDetail />
      <StockInSharePanel type='detail' />
      <StockInDiscountEditDetail type='detail' />
    </>
  )
})

export default StockInReceiptCreate
