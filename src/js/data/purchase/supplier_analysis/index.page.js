import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'common/components/grid'
import Filter from './components/filter'
import Overall from './components/overall'
import RankAmount from './components/rank_amount'
import RankTimes from './components/rank_times'
import RankDuration from './components/rank_duration'
import Table from './components/table'

const MerchantAnalysis = () => {
  return (
    <div>
      <Filter />
      <Grid column={3}>
        <Overall className='b-grid-span-3' />

        <RankAmount className='b-grid-span-1' />
        <RankTimes className='b-grid-span-1' />
        <RankDuration className='b-grid-span-1' />

        <Table className='b-grid-span-3' />
      </Grid>
    </div>
  )
}

MerchantAnalysis.propTypes = {
  xxxx: PropTypes.bool,
}
export default MerchantAnalysis
