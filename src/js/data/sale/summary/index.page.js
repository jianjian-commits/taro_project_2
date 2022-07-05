import React from 'react'
import Grid from 'common/components/grid'
import Filter from './components/filter'
import Overall from './components/overall'
import SaleTrend from './components/sale_trend'
import PriceTrend from './components/price_trend'
import Table from './components/table'

const Detail = () => {
  return (
    <div>
      <Filter />
      <Grid column={2}>
        <Overall className='b-grid-span-2' />

        <SaleTrend className='b-grid-span-1' />
        <PriceTrend className='b-grid-span-1' />

        <Table className='b-grid-span-2' />
      </Grid>
    </div>
  )
}

export default Detail
