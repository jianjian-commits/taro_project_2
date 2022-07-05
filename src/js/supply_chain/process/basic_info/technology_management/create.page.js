import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store/receipt_store'
import TechnologyDetail from './component/technology_detail'
import { withBreadcrumbs } from 'common/service'
import { t } from 'gm-i18n'

const TechnologyDetailCreate = observer(() => {
  useEffect(() => {
    return store.clearStore
  }, [])

  return <TechnologyDetail type='create' />
})

export default withBreadcrumbs([t('新建工艺')])(TechnologyDetailCreate)
