import React, { Component, Fragment } from 'react'
import { Provider, observer } from 'mobx-react'
import Filter from './filter'
import ScheduleBtn from './components/schedule_btn'
import BtnGroup from './components/btn_group'
import OrderPool from './components/order_pool'
import Map from './map'
import GMap from './g_map'
import store from './store'
import { isForeignCustomer } from 'common/util'

@observer
class DriverScheduling extends Component {
  componentDidMount() {
    store.init()
  }

  render() {
    return (
      <Provider store={store}>
        <Filter />

        <div className='b-driver-map-container'>
          <BtnGroup switchOrderTabKey={this.props.switchOrderTabKey} />
          {isForeignCustomer() ? <GMap /> : <Map />}
          <Map />
          <OrderPool />
        </div>

        <ScheduleBtn />
      </Provider>
    )
  }
}

export default DriverScheduling
