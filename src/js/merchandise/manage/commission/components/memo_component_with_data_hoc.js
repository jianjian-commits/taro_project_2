import React from 'react'
import PropTypes from 'prop-types'
import store from './goods_store'

/** 将table某一行数据隔断处理，以达到table全部刷新时，该行数据不变则component props不变，
 *  内部组件若有observer,observer自身有类似pureComponent的机制在，因此props不变，不触发render,不执行方法
 */
const memoComponentWithDataHoc = (Component) => {
  const MyComponent = (props) => {
    const data = store.skus[props.index]

    return <Component {...props} data={data} />
  }

  MyComponent.propTypes = {
    index: PropTypes.number.isRequired,
  }

  MyComponent.defaultProps = {
    index: 0,
  }

  return MyComponent
}

export default memoComponentWithDataHoc
