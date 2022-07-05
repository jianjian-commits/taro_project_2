import React, { createContext } from 'react'
import PropTypes from 'prop-types'
import Header from './header'
import GainDetailsList from './gain_details_list'

export const storeContext = createContext(null)

const { Provider } = storeContext

const DetailsComponent = ({ store }) => {
  return (
    <Provider value={store}>
      <Header />
      <GainDetailsList />
    </Provider>
  )
}

DetailsComponent.propTypes = {
  store: PropTypes.object.isRequired,
}

export default DetailsComponent
