import React from 'react'
import FieldBlock from './components/field_block'
import { t } from 'gm-i18n'

function PrintFooter() {
  return (
    <div className='gm-margin-top-20'>
      <FieldBlock left={t('出库签字')} />
      <FieldBlock left={t('配送签字')} />
      <FieldBlock left={t('客户签字')} />
    </div>
  )
}

export default PrintFooter
