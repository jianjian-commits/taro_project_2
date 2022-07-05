import React, { useEffect } from 'react'
import Detail from './detail/detail'
import Store from './detail/store'

const store = new Store({ type: 'edit' })

const DetailPage = props => {
  const { id } = props.location.query
  useEffect(() => {
    store.getDetail(id)
  }, [])

  return <Detail store={store} id={id} />
}
export default DetailPage
