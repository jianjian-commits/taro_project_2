import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store/receipt_store'
import TechnologyDetail from './component/technology_detail'
import { t } from 'gm-i18n'
import { withBreadcrumbs } from 'common/service'

const TechnologyDetailEdit = observer((props) => {
  const id = props.location.query.id

  useEffect(() => {
    store.fetchTechnologyDetail(id)
    return store.clearStore
  }, [])

  return <TechnologyDetail type='edit' />
})

export default withBreadcrumbs([t('编辑工艺')])(TechnologyDetailEdit)
