import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Price } from '@gmfe/react'
import store from './store'

const MoneySummary = observer(() => {
  return (
    <div>
      {t('总金额变动：')}
      <span className='gm-text-primary gm-text-bold'>
        {Price.getCurrency()} {store.allAbnormalMoney}
      </span>
    </div>
  )
})

export default MoneySummary
