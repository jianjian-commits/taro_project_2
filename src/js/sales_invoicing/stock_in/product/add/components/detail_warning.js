import { t } from 'gm-i18n'
import React from 'react'
import TableListTips from 'common/components/table_list_tips'
import { observer } from 'mobx-react'

const StockInDetailWarning = observer(() => {
  return (
    <TableListTips
      tips={[
        t('当入库单中的商品用于出库、盘点后，此入库单将不能再进行冲销操作'),
      ]}
    />
  )
})

export default StockInDetailWarning
