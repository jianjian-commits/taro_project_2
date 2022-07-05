import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import Grid from 'common/components/grid'
import { setTitle } from '@gm-common/tool'
import Filter from './components/goods_detail/filter'
// import Overall from './components/goods_detail/overall'
import Rank from './components/goods_detail/rank'
import SaleTrend from './components/goods_detail/sale_trend'
import PriceTrend from './components/goods_detail/price_trend'
import Table from './components/goods_detail/table'
import store from './stores/goods_detail'

const Detail = (props) => {
  const { sku_id, salemenu_id, begin_time, end_time } = props.location.query
  store.handleSearch({
    searchText: sku_id,
    salemenu_id: salemenu_id,
    begin_time,
    end_time,
  })
  useEffect(() => {
    setTitle(t('商品销售分析-详情'))
  }, [])
  return (
    <div>
      <Filter />
      <Grid column={2}>
        {/* <Overall className='b-grid-span-2' /> */}

        <PriceTrend className='b-grid-span-2' />

        <SaleTrend className='b-grid-span-1' />
        <Rank className='b-grid-span-1' />

        <Table className='b-grid-span-2' />
      </Grid>
    </div>
  )
}

Detail.propTypes = {
  xxxx: PropTypes.bool,
}
export default Detail
