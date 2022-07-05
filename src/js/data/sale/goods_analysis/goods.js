import React from 'react'
import PropTypes from 'prop-types'
import Grid from 'common/components/grid'
import Filter from './components/goods/filter'
import Overall from './components/goods/overall'
import RankSale from './components/goods/rank_sale'
import RankAfterSale from './components/goods/rank_after_sale'
// import RankHot from './components/goods/rank_hot'
// import RankUnsalable from './components/goods/rank_unsalable'
import Table from './components/goods/table'

const Goods = (props) => {
  return (
    <div>
      <Filter />
      <Grid column={2}>
        {/* 销售数据 */}
        <Overall className='b-grid-span-2' />

        {/* 商品销售排行 */}
        <RankSale className='b-grid-span-1' />
        {/* 售后商品排行 */}
        <RankAfterSale className='b-grid-span-1' />

        {/* 商品畅销和滞销不做 */}
        {/* <RankHot className='b-grid-span-1' />
        <RankUnsalable className='b-grid-span-1' /> */}
        {/* 明细表 */}
        <Table className='b-grid-span-2' />
      </Grid>
    </div>
  )
}

Goods.propTypes = {
  xxxx: PropTypes.bool,
}
export default Goods
