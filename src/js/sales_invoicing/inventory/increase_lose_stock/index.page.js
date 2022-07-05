import React from 'react'
import { FullTab } from '@gmfe/frame'
import { t } from 'gm-i18n'
import MaterialIncrease from './tabs/increase'
import MaterialLoss from './tabs/loss'
import global from 'stores/global'
import FinishedIncrease from './tabs/finished_increase'
import FinishedLoss from './tabs/finished_loss'

const IncreaseLose = () => {
  return (
    <FullTab
      tabs={[
        t('原料报溢记录'),
        t('原料报损记录'),
        global.otherInfo.cleanFood && t('成品报溢记录'),
        global.otherInfo.cleanFood && t('成品报损记录'),
      ].filter((f) => f)}
    >
      <MaterialIncrease />
      <MaterialLoss />
      {global.otherInfo.cleanFood && <FinishedIncrease />}
      {global.otherInfo.cleanFood && <FinishedLoss />}
    </FullTab>
  )
}

export default IncreaseLose
