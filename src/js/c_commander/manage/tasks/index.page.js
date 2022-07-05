import { observer } from 'mobx-react'
import React from 'react'
import Filter from './components/filter'
import CommanderTaskList from './components/list'

@observer
class CommanderTaskTab extends React.Component {
  render() {
    return (
      <>
        <Filter />
        <CommanderTaskList />
      </>
    )
  }
}

export default CommanderTaskTab
