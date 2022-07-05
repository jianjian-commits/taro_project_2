import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'common/components/grid'
import Filter from './components/filter'
import PurchasePrice from './components/purchase_price'
import Price from './components/price'
import Turnover from './components/turnover'
import Table from './components/table'

const MerchantAnalysis = () => {
  return (
    <div>
      <Filter />
      <Grid column={2}>
        <PurchasePrice className='b-grid-span-2' />
        <Price className='b-grid-span-1' />
        <Turnover className='b-grid-span-1' />
        <Table className='b-grid-span-2' />
      </Grid>
    </div>
  )
}

MerchantAnalysis.propTypes = {
  xxxx: PropTypes.bool,
}
export default MerchantAnalysis
