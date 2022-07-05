import React from 'react'
import LogList from './list'
import LogFilter from './filter'

export default class QuotationLog extends React.Component {
  render() {
    return (
      <div>
        <LogFilter />
        <LogList />
      </div>
    )
  }
}
