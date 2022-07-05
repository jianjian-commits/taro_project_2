import React, { useState } from 'react'
import { i18next } from 'gm-i18n'
import { FullTab } from '@gmfe/frame'
import SettleSheet from './settle_sheet'
import UnhandleSheet from './unhandle_sheet'

const PaymentReview = () => {
  const [tabKey, setTabKey] = useState(0)

  return (
    <FullTab
      active={tabKey}
      tabs={[i18next.t('待处理单据'), i18next.t('结款单据')]}
      onChange={(key) => setTabKey(key)}
    >
      <UnhandleSheet />
      <SettleSheet />
    </FullTab>
  )
}

export default PaymentReview
