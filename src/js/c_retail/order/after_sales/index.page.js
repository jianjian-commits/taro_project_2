import React from 'react'
import { observer } from 'mobx-react'

import RefundFilter from './search_filter'
import RefundList from './refund_list'

const RefundAfterSales = observer(props => {
  return (
    <>
      <RefundFilter />
      <RefundList />
    </>
  )
})

export default RefundAfterSales
