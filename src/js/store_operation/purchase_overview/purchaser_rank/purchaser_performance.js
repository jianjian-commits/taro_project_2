import React from 'react'
import { Button, Select, Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { getDateRangeByType } from 'common/util'
import { judgeIfGoCarousel } from 'common/deal_rank_data'

import store from './store'

import SvgNext from 'svg/next.svg'
import TableListTips from '../../../common/components/table_list_tips'
import DropDownDateFilter from 'common/components/drop_down_date_filter'
import HumanPerformance from '../../../common/components/human_performance'

const rankType = [
  { value: 1, text: i18next.t('采购金额') },
  { value: 2, text: i18next.t('采购任务数') },
  { value: 3, text: i18next.t('采购频次') },
]

@observer
class PurchaseOverView extends React.Component {
  componentDidMount() {
    store.init()
    store.getPurchaserRankData()
  }

  handleClick = (obj) => {
    store.setFilterParams(obj)
    store.getPurchaserRankData()
  }

  handleChangeType = (value) => {
    store.setRankTypeData(value)
    store.getPurchaserRankData()
  }

  handleToFullScreen = () => {
    store.setFullScreen(true)
    judgeIfGoCarousel(3, '/supply_chain/purchase/performance/full_screen')
  }

  renderDateRangeInputValue = () => {
    const dateRange = getDateRangeByType(store.dateType)
    return `${dateRange.begin_time}~${dateRange.end_time}`
  }

  render() {
    const { rank_type } = store.filter
    const { dateType, purchaserRankData } = store

    return (
      <>
        <div className='gm-padding-lr-20 gm-padding-tb-10'>
          <Flex alignCenter>
            <div>{i18next.t('下单时间：')}</div>
            <DropDownDateFilter
              type={dateType}
              renderDate={this.renderDateRangeInputValue}
              onChange={this.handleClick}
            />
          </Flex>
        </div>
        <TableListTips
          tips={[
            i18next.t(
              '系统将在当日12:00对前日的数据进行统计，因数据延迟给您带来的不便敬请谅解'
            ),
          ]}
        />

        <div>
          <HumanPerformance
            title={i18next.t('采购员绩效排行榜')}
            rankData={purchaserRankData}
            right={
              <>
                <Select
                  value={rank_type}
                  data={rankType}
                  onChange={this.handleChangeType}
                />
                <Button
                  className='gm-margin-left-15'
                  type='primary'
                  plain
                  onClick={this.handleToFullScreen}
                >
                  {i18next.t('投屏模式')}&nbsp;
                  <SvgNext />
                </Button>
              </>
            }
          />
        </div>
      </>
    )
  }
}

export default PurchaseOverView
