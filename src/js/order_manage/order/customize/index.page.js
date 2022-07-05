import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

const Customize = () => {
  useEffect(() => {
    store.fetchList()
    return () => {
      store.init()
    }
  }, [])
  return (
    <>
      <Filter />
      <List />
    </>
  )
}

export default Customize
