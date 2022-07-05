import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import Filter from './filter'
import List from './list'
import store from './store'

class DeliveryLog extends Component {
  render() {
    return (
      <Provider store={store}>
        <>
          <Filter />
          <List />
        </>
      </Provider>
    )
  }
}

export default DeliveryLog
