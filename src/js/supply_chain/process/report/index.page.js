import React from 'react'
import ReportFilter from './report_filter'
import ReportList from './report_list'
import { observer } from 'mobx-react'
import store from './store'

@observer
class Report extends React.Component {
  render() {
    return (
      <>
        <ReportFilter store={store} />
        <ReportList />
      </>
    )
  }
}

export default Report
