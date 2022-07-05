import React from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { Container, Title } from 'common/components/fullscreen'
import Grid from 'common/components/grid'

// 采购品类分布
import PurchaseCategory from '../components/purchase_category'
import PurchaseScreen from '../components/purchase_screen'
import OtherData from '../components/other_data'

import RankHot from '../../../sale/goods_analysis/components/goods/rank_hot'
import RankUnsalable from '../../../sale/goods_analysis/components/goods/rank_unsalable'
import PurchaseTime from '../components/purchase_time'
import PurchaseRatio from '../components/purchase_ratio'
import PurchaseStaff from '../components/purchase_staff'

const SaleDashBoardFullScreen = () => {
  return (
    <Container className='gm-padding-top-5'>
      <Title
        className='gm-margin-tb-10'
        title={t('销售驾驶舱')}
        time={t('数据时间: 2020年1月1日 --- 2020年12月31日')}
      />
      <Grid bg={false} column={4}>
        {/* 采购品类分布 */}
        <PurchaseCategory theme='ocean' className='b-grid-span-1' />
        <PurchaseScreen
          theme={{
            theme: 'ocean',
            type: 'row',
          }}
          className='b-grid-span-2 b-grid-row-span-2'
        />
        {/* 其他数据 */}
        <OtherData theme='ocean' className='b-grid-span-1' />

        {/* 商品畅销排行 */}
        <RankHot theme='ocean' className='b-grid-span-1' />
        <div className='b-grid-span-1' />

        {/* 商品滞销排行 */}
        <RankUnsalable theme='ocean' className='b-grid-span-1' />
        {/* 采购时长 */}
        <PurchaseTime theme='ocean' className='b-grid-span-1' />
        {/* 采销比 */}
        <PurchaseRatio theme='ocean' className='b-grid-span-1' />
        {/* 采购员排行 */}
        <PurchaseStaff theme='ocean' className='b-grid-span-1' />
      </Grid>
    </Container>
  )
}

SaleDashBoardFullScreen.propTypes = {
  xxxx: PropTypes.bool,
}
export default SaleDashBoardFullScreen
