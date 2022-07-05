import { i18next } from 'gm-i18n'
import React from 'react'
import { Tip, Button } from '@gmfe/react'
import { Request } from '@gm-common/request'

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.handleSubmit = ::this.handleSubmit
  }

  render() {
    return (
      <div className='b-login'>
        <form
          name='gmFormLogin'
          onSubmit={this.handleSubmit}
          className='gm-box-shadow-bottom'
        >
          <h4 className='text-center'>{i18next.t('登录')}</h4>
          <div className='b-login-name'>
            <input
              type='text'
              placeholder={i18next.t('用户名')}
              name='username'
            />
          </div>
          <div className='b-login-name'>
            <input
              type='password'
              placeholder={i18next.t('密码')}
              name='password'
            />
          </div>
          <div className='b-login-button'>
            <Button type='primary' htmlType='submit' block>
              {i18next.t('登录')}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  handleSubmit(event) {
    event.preventDefault()

    const username = event.target.username.value
    const password = event.target.password.value

    if (!(username && password)) {
      Tip.info(i18next.t('输入用户名或者密码'))
      return
    }

    Request('/station/login')
      .data({
        username,
        password,
      })
      .post()
      .then(() => {
        Tip.success(i18next.t('登录成功,1秒后跳转'))
        setTimeout(() => {
          window.location.href = window.location.href.replace(
            window.location.hash,
            ''
          )
        }, 2000)
      })
  }
}

export default Login
