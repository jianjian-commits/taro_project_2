import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import DetailsComponent from './components/details_component'
import details_store from './stores/details_store'
import { withBreadcrumbs } from 'common/service'

const Details = ({ location }) => {
  useEffect(() => {
    const { fetchDetails } = details_store
    fetchDetails(location.query.id)
  }, [location.query.id])

  return <DetailsComponent store={details_store} />
}

Details.propTypes = {
  location: PropTypes.object.isRequired,
}

export default withBreadcrumbs([t('分割单据详情')])(Details)
