import React from 'react'
import { FullTab } from '@gmfe/frame'
import { t } from 'gm-i18n'
import global from 'stores/global'
import InventoryRecord from './tabs/inventory_record'
import ProcessRecord from './tabs/process_record'
import OutMaterialReturn from './tabs/outmaterial_record'
import InventoryReturn from './tabs/inventory_return'
import SplitIn from './tabs/split_in'

const RecordPage = () => {
  return (
    <FullTab
      tabs={[
        t('采购入库'),
        global.otherInfo.cleanFood && t('加工入库'),
        t('销售退货入库'),
        global.otherInfo.cleanFood && t('退料入库'),
        !global.otherInfo.cleanFood && t('分割入库'),
      ].filter((v) => v)}
    >
      {/* 采购入库 */}
      <InventoryRecord />
      {/* 加工入库 */}
      {global.otherInfo.cleanFood && <ProcessRecord />}
      {/* 销售退货入库 */}
      <InventoryReturn />
      {/* 退料入库 */}
      {global.otherInfo.cleanFood && <OutMaterialReturn />}
      {!global.otherInfo.cleanFood && <SplitIn />}
    </FullTab>
  )
}

export default RecordPage
