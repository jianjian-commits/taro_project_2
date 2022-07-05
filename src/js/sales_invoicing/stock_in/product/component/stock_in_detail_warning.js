import { t } from 'gm-i18n'
import React from 'react'
import store from '../store/receipt_store'

import TableListTips from 'common/components/table_list_tips'
import { observer } from 'mobx-react'
import _ from 'lodash'

const PurchaseSheetTip = observer(() => {
  const { purchase_sheet_id } = store.stockInReceiptDetail

  return (
    <>
      {t('当前入库商品信息来源自采购单据')}
      <a
        href={`#/supply_chain/purchase/bills/detail?id=${purchase_sheet_id}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {purchase_sheet_id}
      </a>
      {t('，仅供参考，请根据实际情况修改入库商品信息')}
    </>
  )
})

const SettleSheetNumberTip = observer(() => {
  const { settle_sheet_number } = store.stockInReceiptDetail
  return (
    <>
      {t('当前入库单关联结款单')}
      <a
        href={`#/sales_invoicing/finance/payment_review/${settle_sheet_number}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {settle_sheet_number}
      </a>
    </>
  )
})

const StockInDetailWarning = observer(() => {
  const {
    status,
    purchase_sheet_id,
    settle_sheet_number,
  } = store.stockInReceiptDetail
  const showOperateTip = !_.isNil(status) && status !== 0 && status !== 1

  return (
    <TableListTips
      tips={[
        // eslint-disable-next-line react/jsx-key
        purchase_sheet_id && <PurchaseSheetTip />,
        // eslint-disable-next-line react/jsx-key
        settle_sheet_number && <SettleSheetNumberTip />,
        showOperateTip &&
          t(
            '当入库单中的商品用于出库、退货、盘点后，此入库单将不能再进行审核不通过和冲销操作',
          ),
      ]}
    />
  )
})

export default StockInDetailWarning
