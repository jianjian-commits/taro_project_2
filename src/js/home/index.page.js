import React from 'react'
import PropTypes from 'prop-types'
import HomeNew from './new/index.page'
import HomeOld from './old/index.page'
import store from './new/store'
import { observer } from 'mobx-react'
import { WithBreadCrumbs } from 'common/service'
import { t } from 'gm-i18n'

const Home = () => {
  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('首页'), t('工作台')]} />
      {store.vision === 'new' ? <HomeNew /> : <HomeOld />}
    </>
  )
}

Home.propTypes = {
  xxxx: PropTypes.bool,
}
export default observer(Home)
