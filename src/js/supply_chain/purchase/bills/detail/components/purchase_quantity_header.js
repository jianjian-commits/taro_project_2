import React from 'react'
import TableHeaderSettingHover from '../../../../../common/components/table_header_setting_hover'
import { i18next } from 'gm-i18n'
import globalStore from '../../../../../stores/global'
import { purchaseDefaultPriceName } from '../../util'
import { history } from '../../../../../common/service'

const PurchaseQuantityHeader = (props) => {
  const purchaseRefPriceType = globalStore.otherInfo.purchaseSheetRefPrice
  const handleSetting = () => {
    history.push('/system/setting/system_setting?activeType=procurement')
  }

  return (
    <TableHeaderSettingHover
      title={i18next.t('采购单价')}
      currentSettingType={purchaseRefPriceType}
      settingTypeObject={purchaseDefaultPriceName}
      onSettingClick={handleSetting}
    />
  )
}

export default PurchaseQuantityHeader
