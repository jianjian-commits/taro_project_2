import React from 'react'
import Filter from './components/filter'
import List from './components/list'

const BalanceFlow = props => {
  return (
    <>
      <Filter />
      <List communityInfo={props.location.query} />
    </>
  )
}
export default BalanceFlow
