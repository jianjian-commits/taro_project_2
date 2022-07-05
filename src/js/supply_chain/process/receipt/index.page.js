import React from 'react'
import { observer } from 'mobx-react'
import { FullTab } from '@gmfe/frame'
import Receipt from './receipt/index'
import Technic from './technic/index'
import { i18next } from 'gm-i18n'

const ProcessReceipt = observer(() => {
  return (
    <FullTab
      tabs={[i18next.t('按单据查看'), i18next.t('按工艺查看')]}
      className='b-plan'
    >
      <Receipt />
      <Technic />
    </FullTab>
  )
})

export default ProcessReceipt
