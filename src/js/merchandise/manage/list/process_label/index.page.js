import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './filter'
import List from './list'
import { withBreadcrumbs } from 'common/service'
import { t } from 'gm-i18n'
import store from './store'

const ProcessLabel = observer(() => {
  useEffect(() => {
    store.fetchList()
  }, [])
  return (
    <>
      <Filter />
      <List />
    </>
  )
})

export default withBreadcrumbs([t('商品加工标签')])(ProcessLabel)
