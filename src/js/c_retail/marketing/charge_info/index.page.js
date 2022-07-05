import React from 'react'
import { observer } from 'mobx-react'

import Filter from './components/filter'
import List from './components/list'

@observer
class ChargeList extends React.Component {
  render() {
    return (
      <>
        <Filter />
        <List />
      </>
    )
  }
}

export default ChargeList
