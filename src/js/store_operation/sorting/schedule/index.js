import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTab } from '@gmfe/frame'
import SortingSchedule from './sorting_schedule'
import SorterPerformance from './sorter_rank/sorter_performance'

class Component extends React.Component {
  render() {
    const { activeTab } = this.props.location.query

    return (
      <FullTab
        active={+activeTab || 0}
        tabs={[i18next.t('分拣进度'), i18next.t('分拣员绩效')]}
        className='b-order'
      >
        <SortingSchedule />
        <SorterPerformance />
      </FullTab>
    )
  }
}

export default Component
