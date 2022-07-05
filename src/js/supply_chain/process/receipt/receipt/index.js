import React from 'react'
import { observer } from 'mobx-react'
import { Filter, List } from './components'

const Receipt = () => {
  return (
    <>
      <Filter />
      <List />
    </>
  )
}

export default observer(Receipt)
