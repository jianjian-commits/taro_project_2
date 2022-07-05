import React from 'react'
import { FullTab } from '@gmfe/frame'
import { t } from 'gm-i18n'
import Workshop from './workshop'
import { observer } from 'mobx-react'
import { store } from './store'
import TechnologyList from './technology_management/index.page'

const BasicInfo = observer(() => {
  const { activeIndex } = store

  const handleChangeTab = (index) => {
    store.setActiveTab(index)
  }

  return (
    <FullTab
      tabs={[t('车间'), t('工艺')]}
      active={activeIndex}
      onChange={handleChangeTab}
    >
      <Workshop />
      <TechnologyList />
    </FullTab>
  )
})

export default BasicInfo
