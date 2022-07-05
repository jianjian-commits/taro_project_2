import React from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list_table'

const Technic = observer(() => {
  return (
    <>
      <Filter />
      <List />
    </>
  )
})

export default Technic
