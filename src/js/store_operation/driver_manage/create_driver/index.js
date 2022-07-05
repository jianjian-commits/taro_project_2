import DriverEditor from '../components/driver_editor'
import React, { Fragment } from 'react'
import Store from './store'
import { history } from '../../../common/service'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import classNames from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'

const AccountItem = observer(({ data, driverStore, onValidate }) => {
  const { errorMsg } = driverStore

  return (
    <>
      <input
        value={data.account}
        onChange={driverStore.setAccount}
        placeholder={i18next.t('创建司机账号')}
        onBlur={onValidate}
        style={{ width: '300px' }}
        className='form-control'
        type='text'
      />
      {_.has(errorMsg, 'account') && (
        <div className='help-block'>{errorMsg.account}</div>
      )}
    </>
  )
})

@observer
class PasswordItem extends React.Component {
  render() {
    const { driverStore, onValidate } = this.props
    const { data, errorMsg } = driverStore

    return (
      <>
        <Flex
          className={classNames('gm-form-group', {
            'has-error': _.has(errorMsg, 'password'),
          })}
        >
          <div
            className='gm-form-label control-label'
            style={{ width: '130px', textAlign: 'right' }}
          >
            <span style={{ color: 'red' }}>*</span>
            {i18next.t('密码:')}
          </div>
          <div className='gm-form-field'>
            <input
              value={data.password}
              onChange={driverStore.setPassword}
              placeholder={i18next.t('输入密码')}
              onBlur={onValidate.bind(null, 'password')}
              style={{ width: '300px' }}
              className='form-control'
              type='password'
            />
            {_.has(errorMsg, 'password') && (
              <div className='help-block'>{errorMsg.password}</div>
            )}
          </div>
        </Flex>
        <Flex
          className={classNames('gm-form-group', {
            'has-error': _.has(errorMsg, 'password_check'),
          })}
        >
          <div
            className='gm-form-label control-label'
            style={{ width: '130px', textAlign: 'right' }}
          >
            <span style={{ color: 'red' }}>*</span>
            {i18next.t('确认密码:')}
          </div>
          <div className='gm-form-field'>
            <input
              value={data.password_check}
              onChange={driverStore.setPasswordCheck}
              placeholder={i18next.t('再次输入密码')}
              onBlur={onValidate.bind(null, 'password_check')}
              style={{ width: '300px' }}
              className='form-control'
              type='password'
            />
            {_.has(errorMsg, 'password_check') && (
              <div className='help-block'>{errorMsg.password_check}</div>
            )}
          </div>
        </Flex>
      </>
    )
  }
}

PasswordItem.propTypes = {
  driverStore: PropTypes.object,
  onValidate: PropTypes.func,
}

class CreateDriver extends React.Component {
  driverStore = new Store()

  handleSave = () => {
    this.driverStore.createDriver()
  }

  handleCancel = () => {
    history.push('/supply_chain/distribute/driver_manage')
  }

  render() {
    return (
      <DriverEditor
        onSave={this.handleSave}
        onCancel={this.handleCancel}
        title={i18next.t('新建司机')}
        driverStore={this.driverStore}
        AccountItem={AccountItem}
        PasswordItem={PasswordItem}
        {...this.props}
      />
    )
  }
}

export default CreateDriver
