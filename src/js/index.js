import React from 'react'
import { Provider } from 'react-redux'

import store from './frame/store.js'
import ErrorBoundary from './frame/error'

import Router from './routes.js'

const Root = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <Router />
    </Provider>
  </ErrorBoundary>
)

export default Root
