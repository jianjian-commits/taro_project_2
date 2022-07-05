import React from 'react'

import Filter from './components/filter'
import List from './components/list'

class MemberInfo extends React.Component {
  render() {
    return (
      <>
        <Filter />
        <List />
      </>
    )
  }
}

export default MemberInfo
