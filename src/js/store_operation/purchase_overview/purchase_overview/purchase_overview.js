import React from 'react'
import { Flex, Button } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from './store'
import SvgNext from 'svg/next.svg'
import { getDateRangeByType } from 'common/util'
import { judgeIfGoCarousel } from 'common/deal_rank_data'

import PurchaseSurvey from './components/purchase_survey'
import PurchaseTrend from './components/purchase_trend'
import PurchaserProportion from './components/purchaser_proportion'
import PurchaseCommodity from './components/purchase_commodity'
import SuppliersProportion from './components/suppliers_proportion'
import TableListTips from '../../../common/components/table_list_tips'
import DropDownDateFilter from 'common/components/drop_down_date_filter'

@observer
class PurchaseOverView extends React.Component {
  componentDidMount() {
    store.init()
    store.getFetchData()
  }

  handleClick = (obj) => {
    store.setFilterParams(obj)
    store.getFetchData()
  }

  handleToFullScreen = () => {
    judgeIfGoCarousel(2, '/supply_chain/purchase/overview/full_screen')
  }

  renderDateRangeInputValue = () => {
    const dateRange = getDateRangeByType(store.dateType)
    return `${dateRange.begin_time}~${dateRange.end_time}`
  }

  render() {
    const { dateType } = store

    return (
      <>
        <Flex justifyBetween className='gm-padding-tb-10 gm-padding-lr-20'>
          <Flex alignCenter>
            <div>{i18next.t('下单时间：')}</div>
            <DropDownDateFilter
              type={dateType}
              renderDate={this.renderDateRangeInputValue}
              onChange={this.handleClick}
            />
          </Flex>
          <Button type='primary' plain onClick={this.handleToFullScreen}>
            {i18next.t('投屏模式')}&nbsp;
            <SvgNext />
          </Button>
        </Flex>

        <TableListTips
          tips={[
            i18next.t(
              '系统将在当日12:00对前日的数据进行统计，因数据延迟给您带来的不便敬请谅解',
            ),
          ]}
        />

        <div
          style={{ backgroundColor: '#F7F8FA' }}
          className='gm-padding-lr-20 gm-padding-tb-10'
        >
          {/* 采购概况 */}
          <PurchaseSurvey />
          <div className='gm-padding-5' />

          <Flex row justifyBetween>
            <Flex flex={1} column>
              {/* 采购趋势 */}
              <PurchaseTrend />
            </Flex>
            <div className='gm-padding-5' />
            <Flex flex={1} column>
              {/* 采购商品TOP10 */}
              <PurchaseCommodity />
            </Flex>
          </Flex>
          <div className='gm-padding-5' />
          <Flex row justifyBetween>
            <Flex column flex={1}>
              {/* 采购员占比 */}
              <PurchaserProportion />
            </Flex>
            <div className='gm-padding-5' />
            <Flex column flex={1}>
              {/* 供应商占比 */}
              <SuppliersProportion />
            </Flex>
          </Flex>
        </div>
      </>
    )
  }
}

export default PurchaseOverView
