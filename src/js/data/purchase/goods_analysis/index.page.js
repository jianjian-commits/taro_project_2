import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'common/components/grid'
import Filter from './components/filter'
import Overall from './components/overall'
import PurchaseCategory from './components/purchase_category'
import RankHot from './components/rank_hot'
import RankUnsalable from './components/rank_unsalable'
import RankAmount from './components/rank_amount'
import PurchaseRatio from './components/purchase_ratio'
import Table from './table'

const MerchantAnalysis = () => {
  return (
    <div>
      <Filter />

      <Grid column={6}>
        {/* 销售数据 */}
        <Overall className='b-grid-span-6' />
        {/* 采购品类分类 */}
        <PurchaseCategory className='b-grid-span-2' />
        {/* 商品畅销排名 */}
        <RankHot className='b-grid-span-2' />
        {/* 商品滞销排名 */}
        <RankUnsalable className='b-grid-span-2' />
        {/* 采购金额排名 */}
        <RankAmount className='b-grid-span-3' />
        {/* 采销比 */}
        <PurchaseRatio className='b-grid-span-3' />
        {/* 表格 */}
        <Table className='b-grid-span-6' />
      </Grid>
    </div>
  )
}

MerchantAnalysis.propTypes = {
  xxxx: PropTypes.bool,
}
export default MerchantAnalysis
