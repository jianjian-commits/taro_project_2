import React from 'react'
import OverviewTop from './top'
import OverviewMain from './main'
import store from './stores'

class Overview extends React.Component {
  componentDidMount() {
    store.requestOverviewDetailList()
  }

  render() {
    return (
      <div>
        <OverviewTop />
        <OverviewMain />
      </div>
    )
  }
}
export default Overview
