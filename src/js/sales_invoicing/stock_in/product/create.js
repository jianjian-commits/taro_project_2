import React, { useEffect } from 'react'
import HeaderDetail from './component/header_detail'
import store from './store/receipt_store'
import { observer } from 'mobx-react'
import globalStore from '../../../stores/global'
import StockInDetailWarning from './component/stock_in_detail_warning'
import StockInListEditDetail from './component/stock_in_list_edit_detail'
import StockInDiscountEditDetail from './component/stock_in_discount_edit_detail'
import StockInSharePanel from './component/stock_in_share_panel'
import ScanDrawer from './component/scan_drawer'
import DragWeight from '../../../common/components/weight/drag_weight'
import bridge from '../../../bridge/index'
import { WithBreadCrumbs } from 'common/service'
import { i18next } from 'gm-i18n'

const StockInReceiptCreate = observer((props) => {
  const { settle_supplier_id } = store.stockInReceiptDetail

  useEffect(() => {
    async function fetchData() {
      if (globalStore.hasPermission('get_shelf')) {
        await store.fetchStockInShelfList()
      }

      // 空单不拉取数据
      if (props.location.query.id) {
        store.setReceiptId(props.location.query.id)
        store.fetchStockInReceiptList()
      }

      // 获取参考成本type值
      store.fetchGetShowRefCostType()
    }

    fetchData()

    // 初始化autorun
    store.initAutoRun()

    return store.clear
  }, [])

  const weigh_stock_in = globalStore.groundWeightInfo.weigh_stock_in
  // 是否安装了插件
  const { isInstalled } = bridge.mes_app.getChromeStatus()

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[i18next.t('新建入库单')]} />
      <HeaderDetail type='add' />
      {settle_supplier_id && (
        <>
          <StockInDetailWarning />
          <StockInListEditDetail />
          <StockInSharePanel type='add' />
          <StockInDiscountEditDetail type='add' />
          <ScanDrawer />
          {!!weigh_stock_in && isInstalled && <DragWeight />}
        </>
      )}
    </>
  )
})

export default StockInReceiptCreate
