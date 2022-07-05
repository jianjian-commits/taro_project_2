import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { history } from 'common/service'
import DBActionStorage from 'gm-service/src/action_storage'
import { getDateRangeByType } from 'common/util'
import _ from 'lodash'
import SVGNext from 'svg/next.svg'

import FourCornerBorder from 'common/components/four_corner_border'
import SorterPerformance from 'common/components/human_performance'

import sorterStore from './store'
import store from '../../store'
@observer
class PerformanceFullScreen extends React.Component {
  componentDidMount() {
    store.getServiceTime().then((serviceTime) => {
      // 运营周期默认取第一个
      const { time_config_id } = sorterStore.storageFilter
      const { validateServiceTimeId } = DBActionStorage.helper
      validateServiceTimeId(time_config_id, serviceTime, (val) => {
        sorterStore.setStorageFilterTimeConfig(val)
      })
      sorterStore.getSorterRankData()
    })
    sorterStore.setFullScreen(true)
    this.timer = setInterval(() => {
      sorterStore.getSorterRankData()
    }, 3600 * 1000)
  }

  componentWillUnmount() {
    sorterStore.setFullScreen(false)
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  handleExit = () => {
    history.push('/supply_chain/sorting/schedule?activeTab=1')
  }

  render() {
    const { isFullScreen, sorterRankData, storageFilter } = sorterStore
    const { serviceTime } = store
    const dateRange = getDateRangeByType(storageFilter.type)
    const targetServiceTime = _.find(
      serviceTime,
      (s) => s._id === storageFilter.time_config_id,
    )

    return (
      <div
        className='b-performance-full-screen gm-padding-lr-20'
        style={{ minHeight: '1080px' }}
      >
        <Flex justifyEnd className='gm-padding-top-20 gm-margin-bottom-20'>
          <Flex onClick={this.handleExit} width='80px' height='30px'>
            <FourCornerBorder>
              <Flex
                style={{
                  width: '80px',
                  height: '30px',
                }}
                className='gm-text-white gm-cursor b-sorting-full-screen-button'
                alignCenter
                justifyCenter
              >
                {t('退出投屏')}&nbsp;
                <SVGNext />
              </Flex>
            </FourCornerBorder>
          </Flex>
        </Flex>

        <SorterPerformance
          style={{ marginTop: '60px' }}
          right={
            <Flex
              column
              style={{
                textAlign: 'right',
                marginTop: '30px',
                fontSize: '16px',
                color: '#ffffff',
              }}
            >
              <p>
                {dateRange.begin_time}~{dateRange.end_time}
              </p>
              <p>({targetServiceTime ? targetServiceTime.name : '-'})</p>
            </Flex>
          }
          title={t('分拣员绩效排行榜')}
          rankData={sorterRankData}
          isFullScreen={isFullScreen}
        />
      </div>
    )
  }
}

export default PerformanceFullScreen
