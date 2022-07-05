import DriverEditor from '../components/driver_editor'
import React from 'react'
import Store from './store'
import PropTypes from 'prop-types'
import { history } from '../../../common/service'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { Flex, Button } from '@gmfe/react'
import _ from 'lodash'

const AccountItem = ({ data }) => {
  return (
    <div
      className='form-control'
      style={{ background: '#eee', width: '300px' }}
    >
      {data.account}
    </div>
  )
}

AccountItem.propTypes = {
  data: PropTypes.object,
}

@observer
class PasswordItem extends React.Component {
  state = {
    show: false,
  }

  componentDidMount() {
    const { requiredFields } = this.props
    // 密码重置UI展现和密码检查关联
    requiredFields.delete('password')
    requiredFields.delete('password_check')
  }

  handleShow = () => {
    const { requiredFields } = this.props
    // 密码重置UI展现和密码检查关联
    requiredFields.add('password')
    requiredFields.add('password_check')
    this.setState({ show: true })
  }

  render() {
    const { driverStore, onValidate } = this.props
    const { data, errorMsg } = driverStore
    const { show } = this.state

    return (
      <>
        {show ? (
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
        ) : (
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
              <Button onClick={this.handleShow}>{i18next.t('修改密码')}</Button>
            </div>
          </Flex>
        )}
      </>
    )
  }
}

PasswordItem.propTypes = {
  driverStore: PropTypes.object,
  onValidate: PropTypes.func,
  requiredFields: PropTypes.object,
}

class EditDriver extends React.Component {
  driverStore = new Store()

  handleSave = () => {
    const { id } = this.props.location.query
    this.driverStore.editDriver(id)
  }

  handleCancel = () => {
    history.push('/supply_chain/distribute/driver_manage')
  }

  render() {
    return (
      <DriverEditor
        onSave={this.handleSave}
        onCancel={this.handleCancel}
        title={i18next.t('编辑司机')}
        driverStore={this.driverStore}
        AccountItem={AccountItem}
        PasswordItem={PasswordItem}
        {...this.props}
      />
    )
  }
}

EditDriver.propTypes = {
  location: PropTypes.object,
}

export default EditDriver
