import React from 'react'
import { Flex } from '@gmfe/react'
import { observer } from 'mobx-react'
import DBActionStorage from 'gm-service/src/action_storage'
import ScheduleStatistics from './schedule_statistics'
import CategorySchedule from './category_schedule'
import SortingData from './sorting_data'
import OrderSchedule from './order_schedule'
import FullScreenHeader from './full_screen_header'
import MerchandiseSchedule from './merchandise_schedule'
import scheduleStore from './store'
import store from '../store'

@observer
class SortingScheduleFullScreen extends React.Component {
  async componentDidMount() {
    scheduleStore.setFullScreen(true)
    await store.getServiceTime().then((serviceTime) => {
      const { time_config_id } = scheduleStore.storageFilter
      const { validateServiceTimeId } = DBActionStorage.helper
      // 校验下 运营周期存在则保存 不存在默认取第一个
      validateServiceTimeId(time_config_id, serviceTime, (val) => {
        scheduleStore.setStorageFilterTimeConfig(val)
      })
    })
    this.fetchData()

    // 每8s刷新一次数据
    this.timer = setInterval(() => {
      this.fetchData()
    }, 8000)
  }

  componentWillUnmount() {
    scheduleStore.setFullScreen(false)
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  fetchData() {
    let param = null

    if (this.props.location) {
      // 未开启轮播 从分拣进度页面进入
      param = { ...this.props.location.query }
    } else {
      // 其他页面轮播进入
      param = scheduleStore.handleFilterParam(scheduleStore.storageFilter)
    }
    scheduleStore.fetchData(param)
    scheduleStore.getOrderScheduleData(param)
    scheduleStore.getMerchandiseScheduleData(param)
  }

  render() {
    const param = this.props.location
      ? this.props.location.query
      : scheduleStore.storageFilter
    return (
      <div
        style={{
          color: '#56A3F2',
          minHeight: '1080px',
          fontWeight: 'bold',
        }}
        className='b-full-screen-background gm-padding-bottom-20'
      >
        <FullScreenHeader query={param} />
        <div className='gm-margin-lr-20'>
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
      </div>
    )
  }
}

export default SortingScheduleFullScreen
