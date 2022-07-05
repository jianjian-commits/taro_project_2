import React from 'react'
import { FullTab } from '@gmfe/frame'
import { t } from 'gm-i18n'
import global from 'stores/global'
import OutboundRecord from './tabs/outbound_record'
import OutboundReturn from './tabs/outbound_return'
import PickingReturn from './tabs/picking_return'
import GiveUpPickup from './tabs/give_up_pickup'
import SplitOut from './tabs/split_out'

const RecordPage = () => {
  return (
    <FullTab
      tabs={[
        t('销售出库'),
        t('采购退货出库'),
        t('放弃取货'),
        global.otherInfo.cleanFood && t('领料出库'),
        !global.otherInfo.cleanFood && t('分割出库'),
      ].filter((v) => v)}
    >
      <OutboundRecord />
      <OutboundReturn />
      <GiveUpPickup />
      {/* 领料出库 */}
      {global.otherInfo.cleanFood && <PickingReturn />}
      {!global.otherInfo.cleanFood && <SplitOut />}
    </FullTab>
  )
}

export default RecordPage
