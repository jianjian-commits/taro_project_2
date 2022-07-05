import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import { history } from 'common/service'
import { getDateRangeByType } from 'common/util'
import _ from 'lodash'
import DriverPerformance from 'common/components/human_performance'
import FourCornerBorder from 'common/components/four_corner_border'
import SVGNext from 'svg/next.svg'

import store from './store'
@observer
class FullScreen extends React.Component {
  componentDidMount() {
    store.setValue(true, 'isFullScreen')
    store.fetchServiceTime().then(() => {
      store.fetchList()
    })
    this.timer = setInterval(() => {
      store.fetchList()
    }, 3600 * 1000)
  }

  componentWillUnmount() {
    store.setValue(false, 'isFullScreen')
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  handleExit = () => {
    history.push('/supply_chain/distribute/driver_performance')
  }

  render() {
    const { isFullScreen, driverRankData, storageFilter, serviceTimes } = store
    const dateRange = getDateRangeByType(storageFilter.dateRangeType)
    const targetServiceTime = _.find(
      serviceTimes,
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

        <DriverPerformance
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
              {storageFilter.dateType === '2' && (
                <p>({targetServiceTime ? targetServiceTime.name : '-'})</p>
              )}
            </Flex>
          }
          title={t('司机绩效排行榜')}
          rankData={driverRankData}
          isFullScreen={isFullScreen}
        />
      </div>
    )
  }
}

export default FullScreen
