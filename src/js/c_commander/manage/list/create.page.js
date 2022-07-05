import React, { useEffect } from 'react'
import Detail from './detail/detail'
import Store from './detail/store'

const store = new Store({ type: 'create' })
const CreatePage = () => {
  useEffect(() => {
    store.init()
    return () => {
      store.init()
    }
  }, [])

  return <Detail store={store} />
}
export default CreatePage
