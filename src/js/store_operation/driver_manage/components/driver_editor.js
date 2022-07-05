import React from 'react'
import {
  Form,
  FormItem,
  Switch,
  MoreSelect,
  FormGroup,
  FormPanel,
} from '@gmfe/react'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import _ from 'lodash'
import classNames from 'classnames'
import {
  isNumOrEnglishOrUnderline,
  isChinese,
  getStrByte,
  isNumberCombination,
} from '../../../common/util'

@observer
class DriverEditor extends React.Component {
  constructor(props) {
    super(props)
    this.refform = React.createRef()
  }

  static requiredFields = new Set([
    'account',
    'password',
    'password_check',
    'name',
    'car_model_id',
    'max_load',
    'carrier_id',
  ])

  async componentDidMount() {
    const { driverStore } = this.props

    await driverStore.getCarModelList()
    await driverStore.getCarrierList()

    const { id } = this.props.location.query
    id && driverStore.getDriverDetail(id)
  }

  handleEditPassWord = () => {
    const { driverStore } = this.props
    this.setState({ showPassWord: true })
    driverStore.setPassword({ target: { value: '' } })
  }

  validatePassWorkSame = () => {
    const { driverStore } = this.props
    return driverStore.data.password === driverStore.data.password_check
  }

  // 检查是否修改
  checkModified = (name) => {
    const {
      driverStore: { data, originalData },
    } = this.props
    // 新建返回true
    return originalData ? data[name] !== originalData[name] : true
  }

  handleValidator = async (name, onlyRequire) => {
    const { driverStore } = this.props
    const value = driverStore.data[name]
    const { id } = this.props.location.query

    if (DriverEditor.requiredFields.has(name) && !value) {
      driverStore.addErrors({ name, msg: i18next.t('请填写') })
      return
    }
    // onlyRequire只检查必填字段
    if (onlyRequire === true) return
    let msg = null
    switch (name) {
      case 'account':
        if (value.length > 30 || !isNumOrEnglishOrUnderline(value)) {
          msg = i18next.t('账号长度为1-30位，仅能使用字母，数字，下划线')
        } else if (this.checkModified(name)) {
          const result = await driverStore.checkAccount(value).then(
            (res) => res,
            (res) => res
          )
          if (result.code !== 0) msg = result.msg
        }
        break
      case 'password':
        if (value.length < 6 || value.length > 30 || isChinese(value)) {
          msg = i18next.t('密码长度为6-30位，不可使用中文')
        } else if (
          driverStore.data.password_check &&
          !this.validatePassWorkSame()
        ) {
          msg = i18next.t('两次密码输入不一致！')
        }
        break
      case 'password_check':
        if (value.length < 6 || value.length > 30 || isChinese(value)) {
          msg = i18next.t('密码长度为6-30位，不可使用中文')
        } else if (driverStore.data.password && !this.validatePassWorkSame()) {
          msg = i18next.t('两次密码输入不一致！')
        }
        break
      case 'name':
        if (getStrByte(value) > 20) {
          msg = i18next.t('司机名格式限制为10个汉字或20个英文')
        } else if (this.checkModified(name)) {
          const result = await driverStore.checkName(value, id).then(
            (res) => res,
            (res) => res
          )
          if (result.code !== 0) msg = result.msg
        }
        break
      case 'phone':
        if (!value) return
        if (value.length > 11 || !isNumberCombination(value)) {
          msg = i18next.t('手机号长度为1-11位，且仅为数字')
        } else if (this.checkModified(name)) {
          const result = await driverStore.checkPhone(value, id).then(
            (res) => res,
            (res) => res
          )
          if (result.code !== 0) msg = result.msg
        }
        break
      case 'plate_number':
        if (!value) return
        if (getStrByte(value) > 10) {
          msg = i18next.t('车牌号格式限制为5个汉字或10个英文')
        } else if (this.checkModified(name)) {
          const result = await driverStore.checkPlateNumber(value, id).then(
            (res) => res,
            (res) => res
          )
          if (result.code !== 0) msg = result.msg
        }
        break
      case 'car_model_name':
        if (getStrByte(value) > 20) {
          msg = i18next.t('车型格式限制为10个汉字或20个英文')
        }
        break
      case 'max_load':
        if (_.isNaN(+value) || +value >= 100 || +value <= 0) {
          msg = i18next.t('满载框数格式为1-99数字')
        }
        break
      case 'company_name':
        if (getStrByte(value) > 40) {
          msg = i18next.t('承运商格式限制为20个汉字或40个英文')
        }
        break
      default:
        break
    }
    if (msg === null) {
      driverStore.deleteErrors([name])
      return
    }
    driverStore.addErrors({ name, msg })
  }

  handleSelectCarrier = (item) => {
    const { driverStore } = this.props
    // 新建承运商 更新必填字段
    if (item && item.value === 0) {
      DriverEditor.requiredFields.add('company_name')
      DriverEditor.requiredFields.delete('carrier_id')
    }
    driverStore.deleteErrors(['carrier_id'])
    driverStore.setCarrier(item)
  }

  handleSelectCarModel = (item) => {
    const { driverStore } = this.props
    // 新建车型 更新必填字段
    if (item && item.value === 0) {
      DriverEditor.requiredFields.add('car_model_name')
      DriverEditor.requiredFields.delete('car_model_id')
    }

    driverStore.deleteErrors(['max_load', 'car_model_id'])
    driverStore.setCarModel(item)
  }

  handleSave = () => {
    const { onSave } = this.props
    for (const item of DriverEditor.requiredFields.keys()) {
      this.handleValidator(item, true)
    }
    onSave()
  }

  render() {
    const {
      driverStore,
      title,
      onCancel,
      AccountItem,
      PasswordItem,
    } = this.props
    const {
      data,
      isNewCarrierOrCarModel: { carrier, carModel },
      carrierListWithAdd,
      carModelListWithAdd,
      errorMsg,
    } = driverStore

    return (
      <FormGroup
        formRefs={[this.refform]}
        onCancel={onCancel}
        onSubmit={this.handleSave}
      >
        <FormPanel title={title}>
          <Form ref={this.refform} horizontal labelWidth='130px'>
            <FormItem
              className={classNames({
                'has-error': _.has(errorMsg, 'account'),
              })}
              required
              label={i18next.t('司机账号')}
            >
              <AccountItem
                data={data}
                driverStore={driverStore}
                errorMsg={errorMsg}
                onValidate={this.handleValidator.bind(null, 'account')}
              />
            </FormItem>
            <PasswordItem
              driverStore={driverStore}
              onValidate={this.handleValidator}
              requiredFields={DriverEditor.requiredFields}
            />
            <FormItem label={i18next.t('状态')}>
              <Switch
                onChange={driverStore.setState}
                checked={Boolean(data.state)}
                on={i18next.t('有效')}
                off={i18next.t('无效')}
              />
            </FormItem>
            <FormItem label={i18next.t('司机app')}>
              <Switch
                onChange={driverStore.setAllowLogin}
                checked={Boolean(data.allow_login)}
                on={i18next.t('开启')}
                off={i18next.t('关闭')}
              />
            </FormItem>
            <FormItem
              className={classNames({ 'has-error': _.has(errorMsg, 'name') })}
              required
              label={i18next.t('司机名')}
            >
              <input
                value={data.name}
                onChange={driverStore.setName}
                placeholder={i18next.t('填写司机姓名')}
                onBlur={this.handleValidator.bind(null, 'name')}
                style={{ width: '300px' }}
                className='form-control'
                type='text'
              />
              {_.has(errorMsg, 'name') && (
                <div className='help-block'>{errorMsg.name}</div>
              )}
            </FormItem>
            <FormItem
              className={classNames({
                'has-error': _.has(errorMsg, 'phone'),
              })}
              label={i18next.t('手机号')}
            >
              <input
                value={data.phone}
                onChange={driverStore.setPhone}
                placeholder={i18next.t('填写司机手机号码')}
                onBlur={this.handleValidator.bind(null, 'phone')}
                style={{ width: '300px' }}
                className='form-control'
                type='text'
              />
              {_.has(errorMsg, 'phone') && (
                <div className='help-block'>{errorMsg.phone}</div>
              )}
            </FormItem>
            <FormItem
              className={classNames({
                'has-error': _.has(errorMsg, 'share'),
              })}
              label={i18next.t('是否共享')}
            >
              <Switch
                onChange={driverStore.setShare}
                checked={Boolean(data.share)}
                on={i18next.t('共享')}
                off={i18next.t('不共享')}
              />
            </FormItem>
            <FormItem
              className={classNames({
                'has-error': _.has(
                  errorMsg,
                  carModel ? 'car_model_name' : 'car_model_id'
                ),
              })}
              required
              label={i18next.t('车型')}
            >
              {carModel ? (
                <input
                  value={data.car_model_name}
                  onChange={driverStore.setCarModelName}
                  placeholder={i18next.t('请填写车型名称')}
                  onBlur={this.handleValidator.bind(null, 'car_model_name')}
                  style={{ width: '300px' }}
                  className='form-control'
                  type='text'
                />
              ) : (
                <div style={{ width: '300px' }}>
                  <MoreSelect
                    data={carModelListWithAdd}
                    selected={_.find(
                      carModelListWithAdd,
                      (item) => item.value === data.car_model_id
                    )}
                    onSelect={this.handleSelectCarModel}
                  />
                </div>
              )}
              {_.has(errorMsg, carrier ? 'car_model_name' : 'car_model_id') && (
                <div className='help-block'>
                  {errorMsg[carrier ? 'car_model_name' : 'car_model_id']}
                </div>
              )}
            </FormItem>
            <FormItem
              className={classNames({
                'has-error': _.has(errorMsg, 'plate_number'),
              })}
              label={i18next.t('车牌号')}
            >
              <input
                value={data.plate_number}
                onChange={driverStore.setPlateNumber}
                placeholder={i18next.t('填写车牌号')}
                onBlur={this.handleValidator.bind(null, 'plate_number')}
                style={{ width: '300px' }}
                className='form-control'
                type='text'
              />
              {_.has(errorMsg, 'plate_number') && (
                <div className='help-block'>{errorMsg.plate_number}</div>
              )}
            </FormItem>
            <FormItem
              required
              className={classNames({
                'has-error': _.has(errorMsg, 'max_load'),
              })}
              label={i18next.t('满载框数')}
            >
              {data.car_model_id === 0 ? (
                <>
                  <input
                    type='number'
                    min={0}
                    max={200}
                    className='form-control'
                    style={{ width: '300px' }}
                    onBlur={this.handleValidator.bind(null, 'max_load')}
                    placeholder={i18next.t('满载框数')}
                    value={data.max_load}
                    onChange={driverStore.setMaxLoad}
                  />
                  {_.has(errorMsg, 'max_load') && (
                    <div className='help-block'>{errorMsg.max_load}</div>
                  )}
                </>
              ) : (
                <div
                  className='form-control'
                  style={{ background: '#eee', width: '300px' }}
                >
                  {data.max_load}
                </div>
              )}
            </FormItem>
            <FormItem
              className={classNames({
                'has-error': _.has(
                  errorMsg,
                  carrier ? 'company_name' : 'carrier_id'
                ),
              })}
              required
              label={i18next.t('承运商')}
            >
              {carrier ? (
                <input
                  value={data.company_name}
                  onChange={driverStore.setCompanyName}
                  placeholder={i18next.t('请输入承运商名称')}
                  onBlur={this.handleValidator.bind(null, 'company_name')}
                  style={{ width: '300px' }}
                  className='form-control'
                  type='text'
                />
              ) : (
                <div style={{ width: '300px' }}>
                  <MoreSelect
                    data={carrierListWithAdd}
                    selected={_.find(
                      carrierListWithAdd,
                      (item) => item.value === data.carrier_id
                    )}
                    onSelect={this.handleSelectCarrier}
                  />
                </div>
              )}
              {_.has(errorMsg, carrier ? 'company_name' : 'carrier_id') && (
                <div className='help-block'>
                  {errorMsg[carrier ? 'company_name' : 'carrier_id']}
                </div>
              )}
            </FormItem>
          </Form>
          {this.props.location.query.id && <div style={{ height: '60px' }} />}
        </FormPanel>
      </FormGroup>
    )
  }
}

DriverEditor.propTypes = {
  driverStore: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  location: PropTypes.object,
  title: PropTypes.string,
  AccountItem: PropTypes.func.isRequired,
  PasswordItem: PropTypes.func.isRequired,
}

export default DriverEditor
