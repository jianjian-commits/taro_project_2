import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  FormButton,
  Validator,
  Tip,
  Modal,
  Button,
} from '@gmfe/react'
import { Request } from '@gm-common/request'
import { logout } from '../app/util'

class Component extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      old: '',
      password: '',
      repassword: '',
    }

    this.handleChange = ::this.handleChange
    this.handleSubmit = ::this.handleSubmit
    this.handleCheckPassword = ::this.handleCheckPassword
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleSubmit() {
    Request('/station/password/change')
      .data({
        old: this.state.old,
        new: this.state.password,
      })
      .post()
      .then(() => {
        Tip.success(i18next.t('修改成功'))
        // 登出前，清除gio用户ID
        logout()
      })
  }

  handleCheckPassword(value) {
    if (value !== this.state.password) {
      return i18next.t('两次输入密码不一致')
    }
    return ''
  }

  handleCancel(e) {
    e.preventDefault()
    Modal.hide()
  }

  render() {
    const { password, repassword, old } = this.state
    return (
      <div>
        <Form disabledCol onSubmitValidated={this.handleSubmit}>
          <FormItem
            label={i18next.t('旧密码')}
            required
            validate={Validator.create([], old)}
          >
            <input
              type='password'
              value={old}
              onChange={this.handleChange}
              name='old'
            />
          </FormItem>
          <FormItem
            label={i18next.t('新密码')}
            required
            validate={Validator.create([], password)}
          >
            <input
              type='password'
              value={password}
              onChange={this.handleChange}
              name='password'
            />
          </FormItem>
          <FormItem
            label={i18next.t('再次输入新密码')}
            required
            validate={Validator.create(
              [],
              repassword,
              this.handleCheckPassword,
            )}
          >
            <input
              type='password'
              value={repassword}
              name='repassword'
              onChange={this.handleChange}
            />
          </FormItem>
          <FormButton>
            <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
            <span className='gm-gap-5' />
            <Button type='primary' htmlType='submit'>
              {i18next.t('修改')}
            </Button>
          </FormButton>
        </Form>
      </div>
    )
  }
}

export default Component
