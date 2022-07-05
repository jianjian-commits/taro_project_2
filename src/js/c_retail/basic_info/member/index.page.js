import React from 'react'
import { observer } from 'mobx-react'

import Filter from './components/filter'
import List from './components/list'
import store from './store'

@observer
class UserInfo extends React.Component {
  handleInitQuery = query => {
    for (const key in query) {
      store.setUserFilter(key, query[key])
    }
  }

  componentDidMount() {
    // 纯c首页新增客户跳转
    const { state } = this.props.location
    state && this.handleInitQuery(state)
  }

  render() {
    return (
      <>
        <Filter />
        <List />
      </>
    )
  }
}

export default UserInfo
