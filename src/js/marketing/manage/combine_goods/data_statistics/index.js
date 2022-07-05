import React from 'react'
import Filter from './compoments/filter'
import DataStatistics from './compoments/dataStatistics'
import DataStatisticsStore from './store'

class Statistics extends React.Component {
  render() {
    return (
      <div>
        <Filter filterStore={DataStatisticsStore} />
        <DataStatistics listStore={DataStatisticsStore} />
      </div>
    )
  }
}

export default Statistics
