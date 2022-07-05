import React, { Component } from 'react'
import { t } from 'gm-i18n'
import Grid from 'common/components/grid'
import { setTitle } from '@gm-common/tool'
import Filter from './components/detail/filter'
import Overall from './components/detail/overall'
import Rank from './components/detail/rank'
import Hot from './components/detail/hot'
import SaleTrend from './components/detail/sale_trend'
import PriceTrend from './components/detail/price_trend'
import Table from './components/detail/table'
import store from './stores/detail'
import { observer } from 'mobx-react'

@observer
class Detail extends Component {
  constructor(props) {
    super(props)
    const { id, begin, end } = props.location.query
    store.setFilter({
      begin_time: begin,
      end_time: end,
      id: Number(id),
    })
    setTitle(t('客户购买分析-详情'))
  }

  render() {
    return (
      <div>
        <Filter />
        <Grid column={2}>
          {/* 销售数据 */}
          <Overall className='b-grid-span-2' />

          {/* 购买商品排行 */}
          <Rank className='b-grid-span-1' />
          {/* 购买分类分布 */}
          <Hot className='b-grid-span-1' />

          {/* 客户购买量 */}
          <SaleTrend className='b-grid-span-1' />
          {/* 购买分类分布 */}
          <PriceTrend className='b-grid-span-1' />

          <Table className='b-grid-span-2' />
        </Grid>
      </div>
    )
  }
}

export default Detail
