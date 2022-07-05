import { i18next } from 'gm-i18n'
import React from 'react'
import { Storage } from '@gmfe/react'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const isDebug = __DEBUG__ // eslint-disable-line

const KEY = 'quick_login'

window.__quick_login_set = function (users) {
  // __quick_login_set([{username: 'liming', password: 'Test1234_'}]);
  Storage.set(KEY, users)
}

class QuickLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
    }
  }

  componentDidMount() {
    this.setState({
      users: Storage.get(KEY) || [],
    })
  }

  handleLogin(user) {
    const { username, password } = user
    Request('/station/login')
      .data({
        username,
        password,
      })
      .post()
      .then(() => {
        window.location.href = '/'
      })
  }

  render() {
    const { users } = this.state
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          zIndex: 9999,
          color: 'white',
        }}
      >
        {_.map(users, (user, i) => (
          <div
            key={i}
            onClick={this.handleLogin.bind(this, user)}
            className='gm-cursor'
          >
            {user.remark || user.username}
          </div>
        ))}
        <div>{i18next.t('点击快速登录')}</div>
      </div>
    )
  }
}

export default isDebug ? QuickLogin : () => null
