import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import TechnicCategoryList from './components/technic_category_list'
import { withBreadcrumbs } from 'common/service'
import { t } from 'gm-i18n'
import store from './store'

const TechnicCategory = observer(() => {
  useEffect(() => {
    store.fetchTechnicCategoryList()
  }, [])

  return (
    <>
      <Filter />
      <TechnicCategoryList />
    </>
  )
})

export default withBreadcrumbs([t('工艺类型')])(TechnicCategory)
