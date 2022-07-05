import { observer } from 'mobx-react'
import React from 'react'
import SearchFilter from './search_filter'
import Linelist from './list'

@observer
class LineTab extends React.Component {
  render() {
    return (
      <>
        <SearchFilter />
        <Linelist />
      </>
    )
  }
}

export default LineTab
