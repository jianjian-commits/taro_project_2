import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from './store'
import { FullTabV2 } from '@gmfe/frame'
import MerchandiseTransferList from './list'

const MerchandiseTransfer = observer(() => {
  const { activeTab } = store

  const tabs = [
    { name: t('原料'), key: '1', content: <MerchandiseTransferList /> },
    { name: t('成品'), key: '2', content: <MerchandiseTransferList /> },
  ]
  console.log('render', activeTab, tabs)

  return (
    <FullTabV2
      activeKey={activeTab}
      tabs={tabs}
      onChange={(value) => store.changeTab(value)}
    />
  )
})

export default MerchandiseTransfer
