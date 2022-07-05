import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { getDateRangeByType } from 'common/util'
import { history } from 'common/service'
import SVGNext from 'svg/next.svg'

import FourCornerBorder from 'common/components/four_corner_border'
import PurchasePerformance from 'common/components/human_performance'

import store from './store'
@observer
class PerformanceFullScreen extends React.Component {
  componentDidMount() {
    store.setFullScreen(true)
    store.getPurchaserRankData()
    this.timer = setInterval(() => {
      store.getPurchaserRankData()
    }, 3600 * 1000)
  }

  componentWillUnmount() {
    store.setFullScreen(false)
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  handleExit = () => {
    history.push('/supply_chain/purchase/overview?activeTab=1')
  }

  render() {
    const { isFullScreen, purchaserRankData, dateType } = store
    const dateRange = getDateRangeByType(dateType)

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

        <PurchasePerformance
          rankData={purchaserRankData}
          style={{ marginTop: '60px' }}
          right={
            <p
              style={{
                fontSize: '16px',
                color: '#ffffff',
              }}
            >
              {dateRange.begin_time}~{dateRange.end_time}
            </p>
          }
          title={t('采购员绩效排行榜')}
          isFullScreen={isFullScreen}
        />
      </div>
    )
  }
}

export default PerformanceFullScreen
