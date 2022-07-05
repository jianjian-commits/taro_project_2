import React from 'react'
import Gird from 'common/components/grid'
import Filter from './components/filter'
import PurchaseData from './components/purchase_data'
import OtherData from './components/other_data'
import PurchaseTrend from './components/purchase_trend'

import PurchaseCategory from './components/purchase_category'
import RankHot from './components/rank_hot'
import RankUnsalable from './components/rank_unsalable'

import PurchaseTime from './components/purchase_time'
import PurchaseRatio from './components/purchase_ratio'

import PurchaseAmount from './components/purchase_amount'
import PurchaseRate from './components/purchase_rate'

import PurchaseStaff from './components/purchase_staff'
import PurchaseEfficiency from './components/purchase_efficiency'

const PurchaseDashboard = () => {
  return (
    <>
      <Filter />
      <Gird column={6}>
        {/* 采购数据 */}
        <PurchaseData className='b-grid-span-4' />
        {/* 其他数据 */}
        <OtherData className='b-grid-span-2' />
        {/* 采购金额 */}
        <PurchaseTrend className='b-grid-span-6' />
        {/* 采购品类分布 */}
        <PurchaseCategory className='b-grid-span-2' />
        {/* 商品畅销排行 */}
        <RankHot className='b-grid-span-2' />
        {/* 商品滞销排行 */}
        <RankUnsalable className='b-grid-span-2' />
        {/* 采购时长 */}
        <PurchaseTime className='b-grid-span-3' />
        {/* 采销比 */}
        <PurchaseRatio className='b-grid-span-3' />
        {/* 供应商采购金额 */}
        <PurchaseAmount className='b-grid-span-3' />

        <PurchaseRate className='b-grid-span-3' />
        <PurchaseStaff className='b-grid-span-3' />
        <PurchaseEfficiency className='b-grid-span-3' />
      </Gird>
    </>
  )
}

export default PurchaseDashboard
