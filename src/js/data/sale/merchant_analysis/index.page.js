import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import Filter from './components/index/filter'
import Overall from './components/index/overall'
import Rank from './components/index/rank'
import Trend from './components/index/trend'
import District from './components/index/district'
import Route from './components/index/route'
import Table from './components/index/table'
import Grid from 'common/components/grid'

const MerchantAnalysis = () => {
  return (
    <div>
      <Filter />
      <Grid column={2}>
        <Overall className='b-grid-span-2' />

        <Rank className='b-grid-span-1' />
        <Trend className='b-grid-span-1' />

        <District className='b-grid-span-1' />
        <Route className='b-grid-span-1' />

        <Table className='b-grid-span-2' />
      </Grid>
    </div>
  )
}

MerchantAnalysis.propTypes = {
  xxxx: PropTypes.bool,
}
export default observer(MerchantAnalysis)
