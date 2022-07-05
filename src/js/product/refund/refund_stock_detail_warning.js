import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import TableListTips from 'common/components/table_list_tips'

const RefundStockDetailWarning = ({ settle_sheet_number }) => {
  const tip = (
    <>
      {t('当前退货单关联结款单')}
      <a
        href={`#/sales_invoicing/finance/payment_review/${settle_sheet_number}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {settle_sheet_number}
      </a>
    </>
  )

  return <TableListTips tips={[settle_sheet_number && tip]} />
}

RefundStockDetailWarning.propTypes = {
  settle_sheet_number: PropTypes.string.isRequired,
}

export default RefundStockDetailWarning
