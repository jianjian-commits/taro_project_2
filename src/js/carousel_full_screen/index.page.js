import React from 'react'
import styled from 'styled-components'
import { Carousel } from '@gmfe/react'
import { isInCarouselList } from '../common/deal_rank_data'
import HomeFullScreen from '../home/old/full_screen'
import SortFullScreen from '../store_operation/sorting/schedule/full_screen'
import PurChaseOverViewFullScreen from '../store_operation/purchase_overview/purchase_overview/full_screen'
import PurchaserRankFullScreen from '../store_operation/purchase_overview/purchaser_rank/performance_full_screen'
import SorterRankFullScreen from '../store_operation/sorting/schedule/sorter_rank/performance_full_screen'
import DriverRankFullScreen from '../supply_chain/distribute/driver_performance/full_screen.page'
import SaleDashBoardFullScreen from '../data/dashboard/sale_dashboard/fullscreen/index.page'

import globalStore from 'stores/global'

import { observer } from 'mobx-react'

const DivBox = styled.div`
  width: 100%;
`
@observer
class Component extends React.Component {
  render() {
    const { currentIndex } = this.props.location.query
    return (
      <Carousel
        defaultIndex={+currentIndex}
        delay={+globalStore.fullScreenInfo.stay_time * 1000} // 轮播时延
        isStopByHoverContent={false}
        transitionTime={1000} // 切换时间（ms）
        onIndexChange={this.handleChange}
        style={{ width: '100%', minHeight: '1080px', overflow: 'hidden' }}
      >
        {/* 首页投屏 */}
        {isInCarouselList(1) && (
          <DivBox>
            <HomeFullScreen />
          </DivBox>
        )}
        {/* 采购总览 */}
        {isInCarouselList(2) && (
          <DivBox>
            <PurChaseOverViewFullScreen />
          </DivBox>
        )}
        {/* 采购员绩效 */}
        {isInCarouselList(3) && (
          <DivBox>
            <PurchaserRankFullScreen />
          </DivBox>
        )}
        {/* 分拣进度 */}
        {isInCarouselList(4) && (
          <DivBox>
            <SortFullScreen />
          </DivBox>
        )}
        {/* 分拣员绩效 */}
        {isInCarouselList(5) && (
          <DivBox>
            <SorterRankFullScreen />
          </DivBox>
        )}
        {/* 司机绩效 */}
        {isInCarouselList(6) && (
          <DivBox>
            <DriverRankFullScreen />
          </DivBox>
        )}
        {/* 销售驾驶仓 */}
        {isInCarouselList(7) && (
          <DivBox>
            <SaleDashBoardFullScreen />
          </DivBox>
        )}
      </Carousel>
    )
  }
}

export default Component
