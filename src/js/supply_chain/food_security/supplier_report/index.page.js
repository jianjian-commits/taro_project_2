import React, { Component } from 'react'
import Filter from './components/filter'
import { observer } from 'mobx-react'
import { store } from './store'
import List from './components/list'

@observer
class SupplierReport extends Component {
  componentDidMount() {
    this.handleSearch()
  }

  handleSearch = () => {
    const {
      trueFilter,
      pagination: { limit },
    } = store
    store.fetchList({ ...trueFilter, limit })
  }

  render() {
    return (
      <>
        <Filter onSearch={this.handleSearch} />
        <List />
      </>
    )
  }
}

export default SupplierReport
