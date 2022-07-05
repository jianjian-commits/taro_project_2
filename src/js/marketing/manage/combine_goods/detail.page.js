import React, { useEffect } from 'react'
import Detail from './combine_goods_detail/detail'
import Store from './combine_goods_detail/store'
import { Provider } from 'mobx-react'

const store = new Store({ type: 'edit' })

const EditPage = (props) => {
  useEffect(() => {
    const { id } = props.location.query
    store.initStore(id)
  }, [])

  return (
    <Provider store={store}>
      <Detail {...props} />
    </Provider>
  )
}

export default EditPage
