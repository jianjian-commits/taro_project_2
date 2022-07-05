import React, { useEffect } from 'react'
import { Provider } from 'mobx-react'
import BatchAdd from './batch_add_salemenus/add'
import Store from './batch_add_salemenus/store'

const store = new Store()

const AddSaleMenusPage = (props) => {
  useEffect(() => {
    const { query } = props.location.query
    store.initStore(JSON.parse(query))
    return () => {
      store.clear()
    }
  }, [])

  return (
    <Provider store={store}>
      <BatchAdd {...props} />
    </Provider>
  )
}

export default AddSaleMenusPage
