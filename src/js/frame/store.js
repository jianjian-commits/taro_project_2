import { createStore } from 'redux-async-actions-reducers'
import { compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './../reducers'

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk),
    __DEBUG__ && window.devToolsExtension
      ? window.devToolsExtension()
      : (f) => f // eslint-disable-line
  )
)

export default store
