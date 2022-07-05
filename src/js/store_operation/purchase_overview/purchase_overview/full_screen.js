import React from 'react'
import { Flex } from '@gmfe/react'
import { t } from 'gm-i18n'
import { history } from 'common/service'
import { getDateRangeByType } from 'common/util'
import SVGNext from 'svg/next.svg'
import store from './store'
import FourCornerBorder from 'common/components/four_corner_border'

import PurchaseSurvey from './components/purchase_survey'
import PurchaseTrend from './components/purchase_trend'
import PurchaserProportion from './components/purchaser_proportion'
import PurchaseCommodity from './components/purchase_commodity'
import SuppliersProportion from './components/suppliers_proportion'

class FullScreen extends React.Component {
  componentDidMount() {
    store.setFullScreen(true)
    store.getFetchData()
    this.timer = setInterval(() => {
      store.getFetchData()
    }, 3600 * 1000)
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    store.setFullScreen(false)
  }

  handleExit = () => {
    history.push('/supply_chain/purchase/overview?activeTab=0')
  }

  render() {
    const { dateType } = store
    const dateRange = getDateRangeByType(dateType)

    return (
      <div
        className='b-purchase-overview-fullScreen gm-padding-lr-20'
        style={{ minHeight: '1080px' }}
      >
        <Flex justifyBetween className='gm-padding-top-10 gm-margin-bottom-20'>
          <Flex
            className='gm-padding-top-5'
            style={{
              fontSize: '16px',
              color: '#ffffff',
            }}
          >
            <span style={{ fontSize: '20px' }}>{t('采购总览')}</span>
            &nbsp;&nbsp;
            <span className='gm-padding-top-5'>
              {dateRange.begin_time}~{dateRange.end_time}
            </span>
          </Flex>
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

        <PurchaseSurvey />
        <div className='gm-gap-20 ' />

        <Flex row justifyBetween>
          <Flex flex={1} column>
            {/* 采购趋势 */}
            <PurchaseTrend />
          </Flex>
          <div className='gm-gap-10' />
          <Flex flex={1} column>
            {/* 采购商品TOP10 */}
            <PurchaseCommodity />
          </Flex>
        </Flex>
        <div className='gm-gap-20' />
        <Flex row justifyBetween>
          <Flex column flex={1}>
            {/* 采购员占比 */}
            <PurchaserProportion />
          </Flex>
          <div className='gm-gap-10' />
          <Flex column flex={1}>
            {/* 供应商占比 */}
            <SuppliersProportion />
          </Flex>
        </Flex>
      </div>
    )
  }
}

export default FullScreen
