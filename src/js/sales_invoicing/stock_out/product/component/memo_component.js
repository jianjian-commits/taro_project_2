import React from 'react'
import PropTypes from 'prop-types'
import store from '../store/receipt_store'

const memoComponentHoc = (Component, compareFunc) => {
  const MyComponent = React.memo(
    (props) => {
      const data = store.outStockList[props.index]

      return <Component {...props} data={data} />
    },
    (prev, next) => {
      if (compareFunc) {
        return compareFunc(prev, next)
      } else {
        return false
      }
    }
  )

  MyComponent.propTypes = {
    index: PropTypes.number,
  }
  return MyComponent
}

export default memoComponentHoc
