import React from 'react'
import { Provider } from 'mobx-react'
import store from './store'
import Filter from './components/filter'
import Map from './components/map'
import List from './components/list'
import GMap from './components/google_map'
import { isForeignCustomer } from 'common/util'

export default class ControlCenter extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <>
          <Filter />
          {isForeignCustomer() ? <GMap /> : <Map />}
          <List />
        </>
      </Provider>
    )
  }
}
