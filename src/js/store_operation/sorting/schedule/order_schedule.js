import React from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import OrderSchedulePie from './order_schedule_pie'
import OrderScheduleList from './order_schedule_list'
import { Box, Flex } from '@gmfe/react'
import scheduleStore from './store'
import uiStyle from './ui_style'
import PurchaseOverviewTitle from '../../common/purchase_overview_title'
import FourCornerBorder from 'common/components/four_corner_border'

@observer
class OrderSchedule extends React.Component {
  contentComponent = () => {
    const { isFullScreen } = scheduleStore

    return (
      <Box
        style={uiStyle.getQuickPanelStyle(isFullScreen)}
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <PurchaseOverviewTitle
          title={i18next.t('订单分拣进度')}
          type={!isFullScreen ? 'more' : 'fullScreen'}
          linkText={i18next.t('查看更多')}
          linkRoute='/supply_chain/sorting/detail?tab=1'
        />
        <Flex style={{ height: '490px' }}>
          <Flex flex={4.5}>
            <OrderSchedulePie />
          </Flex>
          <OrderScheduleList />
        </Flex>
      </Box>
    )
  }

  render() {
    const { isFullScreen } = scheduleStore
    return isFullScreen ? (
      <FourCornerBorder>{this.contentComponent()}</FourCornerBorder>
    ) : (
      this.contentComponent()
    )
  }
}

export default OrderSchedule
