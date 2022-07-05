import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'

import store from './store'
import Header from './components/header'
import List from './components/list'
import { WithBreadCrumbs } from 'common/service'

const Details = ({ location }) => {
  useEffect(() => {
    const { fetchDetails, setId } = store
    fetchDetails(location.query.id)
    setId(location.query.id)
  }, [])
  return (
    <>
      <WithBreadCrumbs
        breadcrumbs={[t('订单'), t('订单'), t('改单审核'), t('改单详情')]}
      />
      <Header />
      <List />
    </>
  )
}

Details.propTypes = {
  location: PropTypes.object,
}

export default Details
