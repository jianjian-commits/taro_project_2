import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import Gird from 'common/components/grid'
import Filter from './components/filter'
import SaleData from './components/sale_data'
import OtherData from './components/other_data'
import SaleTrend from './components/sale_trend'
import SaleHot from './components/sale_hot'
import SaleRankMerchant from './components/sale_rank_merchant'
import SaleRankAmount from './components/sale_rank_amount'
import SaleRankPerformance from './components/sale_rank_performance'
import SaleException from './components/sale_exception'
import SaleMap from './components/sale_map'

const SummaryDashboard = () => {
  return (
    <div>
      <Filter />
      <Gird column={3}>
        <SaleData className='b-grid-span-2' />
        <OtherData className='b-grid-span-1' />

        <SaleTrend className='b-grid-span-2' />
        <SaleHot className='b-grid-span-1' />

        <SaleRankMerchant className='b-grid-span-1' />
        <SaleRankAmount className='b-grid-span-1' />
        <SaleRankPerformance className='b-grid-span-1' />

        <Flex className='b-grid-span-3'>
          <SaleException className='gm-flex-flex' />
          <SaleMap className='gm-flex-flex gm-margin-left-15' />
        </Flex>
      </Gird>
    </div>
  )
}

SummaryDashboard.propTypes = {
  xxxx: PropTypes.bool,
}
export default SummaryDashboard
