import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'

const HeaderLeft = observer(() => {
  const { id } = store.stockInReceiptDetail

  return (
    <Flex alignCenter>
      <div className='b-stock-in-title'>{t('入库单号')}:&nbsp;</div>
      <div className='b-stock-in-content'>{id || '-'}</div>
    </Flex>
  )
})

export default HeaderLeft
