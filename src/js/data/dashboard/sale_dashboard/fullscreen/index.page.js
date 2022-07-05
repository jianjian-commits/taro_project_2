import React, { Component } from 'react'
import { t } from 'gm-i18n'
import { Container, Title } from 'common/components/fullscreen'
import Grid from 'common/components/grid'

import SaleRankAmount from '../components/sale_rank_amount'
import SaleMapScreen from '../components/sale_map_screen'
import SaleRankMerchant from '../components/sale_rank_merchant'

import SaleHot from '../components/sale_hot'
import SaleTrend from '../components/sale_trend'
import SaleException from '../components/sale_exception'
import moment from 'moment'
import store from '../store'

class SaleDashBoardFullScreen extends Component {
  constructor(props) {
    super(props)
    if (this.props.location) {
      const { begin, end, areaCode } = this.props.location.query
      store.setFilter({ begin_time: begin, end_time: end, areaCode: areaCode })
    }
  }

  render() {
    const { begin, end } = this.props.location
      ? this.props.location.query
      : {
          begin: moment().subtract(6, 'd').format('YYYY-MM-DD'),
          end: moment().format('YYYY-MM-DD'),
        }
    console.log(begin, end)
    return (
      <Container className='gm-padding-top-5'>
        <Title
          className='gm-margin-tb-10'
          title={t('销售驾驶舱')}
          time={t(`数据时间: ${begin} --- ${end}`)}
          layout={t('退出投屏')}
        />
        {/* 商品销售额排行 */}
        <Grid bg={false} column={4}>
          <SaleRankAmount
            theme={{
              theme: 'ocean',
              type: 'column',
            }}
            className='b-grid-span-1'
          />
          <SaleMapScreen theme='ocean' className='b-grid-span-2' />
          {/* 商户销量排名 */}
          <SaleRankMerchant
            theme={{
              theme: 'ocean',
              type: 'column',
            }}
            className='b-grid-span-1'
          />
          {/* 热销分类 */}
          <SaleHot theme='ocean' className='b-grid-span-1' />
          {/* 销售趋势 */}
          <SaleTrend theme='ocean' className='b-grid-span-2' />
          {/* 售后趋势 */}
          <SaleException theme='ocean' className='b-grid-span-1' />
        </Grid>
      </Container>
    )
  }
}

export default SaleDashBoardFullScreen
