import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Select, Button } from '@gmfe/react'
import SVGNext from 'svg/next.svg'
import store from './store'
import Filter from './components/filter'
import HumanPerformance from 'common/components/human_performance'
import { judgeIfGoCarousel } from 'common/deal_rank_data'

const selectData = [
  {
    value: 1,
    text: t('已配送任务数'),
  },
  {
    value: 2,
    text: t('已配送销售额'),
  },
]

@observer
class DriverPerformance extends React.Component {
  componentDidMount() {
    store.init()
    store.fetchServiceTime().then(() => {
      store.fetchList()
    })
  }

  handleChangeValue = (value) => {
    store.setFilterValue(value, 'rank_type')
    store.fetchList()
  }

  handleToFullScreen = () => {
    judgeIfGoCarousel(
      6,
      '/supply_chain/distribute/driver_performance/full_screen',
    )
  }

  render() {
    const { rank_type } = store.filter
    const { driverRankData } = store

    return (
      <>
        <Filter />
        <div className='gm-padding-5' style={{ backgroundColor: '#F7F8FA' }} />
        <div>
          <HumanPerformance
            title={t('司机绩效排行榜')}
            rankData={driverRankData}
            right={
              <div>
                <Select
                  data={selectData}
                  value={rank_type}
                  onChange={this.handleChangeValue}
                />
                <Button
                  type='primary'
                  plain
                  onClick={this.handleToFullScreen}
                  className='gm-margin-left-15'
                >
                  {t('投屏模式')} <SVGNext />
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }
}

export default DriverPerformance
