import React from 'react'
import { t } from 'gm-i18n'
import DetailsComponent from './components/details_component'
import create_store from './stores/create_store'
import { withBreadcrumbs } from 'common/service'

const Create = () => {
  return <DetailsComponent store={create_store} />
}

export default withBreadcrumbs([t('新建分割单据')])(Create)
