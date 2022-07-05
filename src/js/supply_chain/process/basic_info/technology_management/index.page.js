import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import HeaderFilter from './component/header_filter'
import TechnologyListTable from './component/technology_list_table'

import store from './store/list_store'

const TechnologyList = observer(() => {
  useEffect(() => {
    store.pagination.current.apiDoFirstRequest()
  }, [])

  return (
    <>
      <HeaderFilter />
      <TechnologyListTable />
    </>
  )
})

export default TechnologyList
