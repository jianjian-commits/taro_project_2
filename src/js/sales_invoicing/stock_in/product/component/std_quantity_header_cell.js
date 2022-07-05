import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { history } from 'common/service'
import globalStore from 'stores/global'
import TableHeaderSettingHover from 'common/components/table_header_setting_hover'

const StcQuantityHeaderCell = observer(() => {
  const inStockRefPriceType = globalStore.otherInfo.inStockRefPrice
  const handleSetting = () => {
    history.push('/system/setting/system_setting?activeType=sales_invoicing')
  }

  return (
    <TableHeaderSettingHover
      title={i18next.t('入库单价（基本单位）')}
      currentSettingType={inStockRefPriceType}
      onSettingClick={handleSetting}
    />
  )
})

export default StcQuantityHeaderCell
