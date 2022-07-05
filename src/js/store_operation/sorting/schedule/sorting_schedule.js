import React from 'react'
import { Flex } from '@gmfe/react'
import { observer } from 'mobx-react'
import SearchFilter from './search_filter'
import ScheduleStatistics from './schedule_statistics'
import CategorySchedule from './category_schedule'
import SortingData from './sorting_data'
import OrderSchedule from './order_schedule'
import MerchandiseSchedule from './merchandise_schedule'
import scheduleStore from './store'

@observer
class SortingSchedule extends React.Component {
  constructor(props) {
    super(props)

    scheduleStore.init()
  }

  render() {
    return (
      <>
        <SearchFilter />
        <div
          style={{ backgroundColor: '#F7F8FA' }}
          className='gm-padding-lr-20 gm-padding-tb-10'
        >
          <Flex justifyBetween>
            <Flex flex={3} style={{ marginRight: '10px' }}>
              <ScheduleStatistics /> {/* 整体进度 */}
            </Flex>
            <Flex flex={2}>
              <SortingData /> {/* 分拣数据 */}
            </Flex>
          </Flex>
          <div className='gm-padding-5' />
          <Flex justifyBetween>
            <Flex column flex className='gm-margin-right-5'>
              <Flex column flex>
                <OrderSchedule /> {/* 订单进度 */}
              </Flex>
            </Flex>
            <Flex column flex className='gm-margin-left-5'>
              <Flex column flex>
                <CategorySchedule /> {/* 分类进度 */}
              </Flex>
            </Flex>
          </Flex>
          <div className='gm-padding-5' />
          <MerchandiseSchedule /> {/* 商品进度 */}
        </div>
      </>
    )
  }
}

export default SortingSchedule
