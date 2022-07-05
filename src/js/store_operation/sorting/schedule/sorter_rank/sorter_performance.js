import React from 'react'
import { i18next } from 'gm-i18n'
import { Button } from '@gmfe/react'
import { observer } from 'mobx-react'
import SearchFilter from './components/sorting_performance_filter'
import { judgeIfGoCarousel } from 'common/deal_rank_data'
import HumanPerformance from 'common/components/human_performance'
import SvgNext from 'svg/next.svg'
import store from './store'

@observer
class SortingSchedule extends React.Component {
  constructor(props) {
    super(props)

    store.init()
  }

  handleToFullScreen = () => {
    store.setFullScreen(true)
    judgeIfGoCarousel(5, '/supply_chain/sorting/performance/full_screen')
  }

  render() {
    const { sorterRankData } = store

    return (
      <>
        <SearchFilter />
        <div className='gm-padding-5' style={{ backgroundColor: '#F7F8FA' }} />
        <HumanPerformance
          title={i18next.t('分拣员绩效排行榜')}
          rankData={sorterRankData}
          right={
            <Button
              className='gm-margin-left-15'
              type='primary'
              plain
              onClick={this.handleToFullScreen}
            >
              {i18next.t('投屏模式')}&nbsp;
              <SvgNext />
            </Button>
          }
        />
      </>
    )
  }
}

export default SortingSchedule
