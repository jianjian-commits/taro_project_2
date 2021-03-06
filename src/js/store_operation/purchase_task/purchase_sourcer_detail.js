import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Switch,
  Flex,
  Dialog,
  Form,
  FormItem,
  Validator,
  FormBlock,
  Tip,
  FormPanel,
  FormGroup,
  MoreSelect,
} from '@gmfe/react'
import './actions.js'
import './reducer.js'
import actions from '../../actions'
import _ from 'lodash'
import { history } from '../../common/service'
import {
  isNumOrEnglishOrUnderline,
  isChinese,
  getStrByte,
  isNumberCombination,
} from '../../common/util'
import globalStore from '../../stores/global'
import { adapterMoreSelectComData } from 'common/util'

class PurchaseSourcerDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      userName: '',
      password: '',
      confirmPassword: '',
      status: 0,
      name: '',
      phone: '',
      appLimit: 0,
      protocol_price: 0,
      suppliers: [],
      isModify: false,
      seleted_suppliers: [],
    }
    this.suppliersBk = []
    this.refform = React.createRef()
    this.handleModify = ::this.handleModify
    this.handleChange = ::this.handleChange
    this.handleChangeAppLimit = ::this.handleChangeAppLimit
    this.handleSupplierSelect = ::this.handleSupplierSelect
    this.handleChangeStatus = ::this.handleChangeStatus
    this.handleChangeStatus = ::this.handleChangeStatus
    this.handleSubmit = ::this.handleSubmit
    this.handlePhoneChange = ::this.handlePhoneChange
    this.handleChangePrice = ::this.handleChangePrice
  }

  componentDidMount() {
    const userId = this.props.params.id
    actions
      .purchase_sourcer_search('', { offset: 0, limit: 10 })
      .then((json) => {
        if (!json.code) {
          actions.supplier_list_get().then((result) => {
            this.setState(
              {
                suppliers: adapterMoreSelectComData(result),
              },
              () => {
                userId && this.getPurchaseSourcerDetail(userId)
              },
            )
          })
        }
      })
  }

  getPurchaseSourcerDetail(id) {
    actions.purchase_sourcer_get_detail(id).then((json) => {
      if (!json.code) {
        const data = json.data
        const initialSeleted = _.filter(this.state.suppliers, (supplier) => {
          const result = _.find(
            data.settle_suppliers,
            (item) => item.id === supplier.id,
          )
          if (result) return true
        })
        this.suppliersBk = initialSeleted
        this.setState({
          userName: data.username,
          status: data.status,
          name: data.name,
          phone: data.phone,
          appLimit: data.is_allow_login,
          seleted_suppliers: initialSeleted,
          initName: data.name,
          protocol_price: data.edit_protocol_price,
        })
      }
    })
  }

  handleModify() {
    this.setState({ isModify: true })
  }

  handleChange(e) {
    const value = (e.target.value + '').trim()
    this.setState({ [e.target.name]: value })
  }

  handlePhoneChange(e) {
    const phone = (e.target.value + '').trim()
    if (phone.length <= 20 && isNumberCombination(phone)) {
      this.setState({ phone })
    }
  }

  handleChangeAppLimit(e) {
    this.setState({ appLimit: e })
  }

  handleChangePrice(e) {
    this.setState({ protocol_price: e })
  }

  handleChangeStatus(flag) {
    this.setState({ status: flag })
  }

  handleSupplierSelect(seleted_suppliers) {
    this.setState({ seleted_suppliers })
  }

  renderPasswordInput(isModify) {
    const { password, confirmPassword } = this.state
    return (
      <FormBlock>
        <FormItem
          className
          label={isModify ? i18next.t('?????????') : i18next.t('??????')}
          required
          validate={Validator.create(
            [],
            password,
            this.checkPassword.bind(this, password),
          )}
        >
          <input
            type='password'
            name='password'
            className='form-control'
            value={password}
            onChange={this.handleChange}
          />
        </FormItem>
        <FormItem
          label={i18next.t('????????????')}
          required
          validate={Validator.create(
            [],
            confirmPassword,
            this.checkConfirmPassword.bind(this, confirmPassword),
          )}
        >
          <input
            type='password'
            name='confirmPassword'
            className='form-control'
            value={confirmPassword}
            onChange={this.handleChange}
          />
        </FormItem>
      </FormBlock>
    )
  }

  checkUserName(userName) {
    if (!userName) {
      return i18next.t('???????????????')
    } else if (userName.length > 30 || !isNumOrEnglishOrUnderline(userName)) {
      return i18next.t('???????????????1-30?????????????????????????????????????????????')
    }
  }

  checkPassword(password) {
    if (!password) {
      return i18next.t('???????????????')
    } else if (
      password.length < 6 ||
      password.length > 30 ||
      isChinese(password)
    ) {
      return i18next.t('???????????????6-30????????????????????????')
    }
  }

  checkConfirmPassword(confirmPassword) {
    if (!confirmPassword) {
      return i18next.t('?????????????????????')
    } else if (this.state.password !== confirmPassword) {
      return i18next.t('?????????????????????')
    }
  }

  checkName(name) {
    if (!name) {
      return i18next.t('???????????????')
    } else if (getStrByte(name) > 30) {
      return i18next.t('???????????????1-30')
    }
  }

  handleConfirm() {
    const userId = this.props.params.id
    const tip = userId ? i18next.t('???????????????') : i18next.t('???????????????')
    const {
      name,
      phone,
      userName,
      status,
      appLimit,
      seleted_suppliers,
      password,
      protocol_price,
    } = this.state
    const settle_suppliers = _.map(seleted_suppliers, (item) => item.id)
    return actions
      .purchase_sourcer_update({
        name,
        userName,
        password,
        phone,
        status,
        is_allow_login: appLimit,
        settle_suppliers,
        id: userId,
        edit_protocol_price: protocol_price,
      })
      .then((json) => {
        if (!json.code) {
          history.push('/supply_chain/purchase/information?tab=get_purchaser')
          Tip.success(tip)
        }
      })
  }

  handleSubmit() {
    const seletedSuppliers = this.state.seleted_suppliers || []
    const isDifference =
      seletedSuppliers.length !== this.suppliersBk.length ||
      _.differenceBy(seletedSuppliers, this.suppliersBk, 'id').length
    if (isDifference) {
      Dialog.confirm({
        children: (
          <div>
            <span>
              {i18next.t(
                '???????????????????????????????????????????????????????????????????????????????????????????????????',
              )}
            </span>
            <span className='b-warning-tips gm-inline-block'>
              {i18next.t(
                '????????????????????????????????????????????????????????????????????????????????????',
              )}
            </span>
          </div>
        ),
      }).then(() => {
        this.handleConfirm()
      })
    } else {
      this.handleConfirm()
    }
  }

  render() {
    const userId = this.props.params.id
    const {
      name,
      phone,
      userName,
      status,
      appLimit,
      suppliers,
      isModify,
      seleted_suppliers,
      protocol_price,
    } = this.state
    const can_edit_purchaser = globalStore.hasPermission('edit_purchaser')

    return (
      <FormGroup
        onCancel={() => window.closeWindow()}
        disabled={!can_edit_purchaser}
        onSubmitValidated={this.handleSubmit}
        formRefs={[this.refform]}
      >
        <FormPanel
          title={userId ? i18next.t('???????????????') : i18next.t('???????????????')}
        >
          <Form
            hasButtonInGroup
            ref={this.refform}
            labelWidth='150px'
            colWidth='400px'
          >
            <FormItem
              label={i18next.t('??????')}
              required
              validate={Validator.create(
                [],
                userName,
                this.checkUserName.bind(this, userName),
              )}
            >
              {userId ? (
                <Flex className='form-control gm-border-0'>{userName}</Flex>
              ) : (
                <input
                  type='text'
                  name='userName'
                  className='form-control'
                  value={userName}
                  onChange={this.handleChange}
                />
              )}
            </FormItem>
            {userId
              ? can_edit_purchaser &&
                (isModify ? (
                  this.renderPasswordInput(isModify)
                ) : (
                  <FormItem label={i18next.t('??????')}>
                    <a
                      className='form-control gm-border-0'
                      onClick={this.handleModify}
                    >
                      {i18next.t('????????????')}
                    </a>
                  </FormItem>
                ))
              : this.renderPasswordInput()}
            <FormItem label={i18next.t('??????')}>
              <Flex className='form-control gm-border-0'>
                <Switch
                  type='primary'
                  checked={+status === 1}
                  on={i18next.t('??????')}
                  off={i18next.t('??????')}
                  onChange={this.handleChangeStatus}
                  disabled={!can_edit_purchaser}
                />
              </Flex>
              {+status === 0 ? (
                <Flex flex style={{ color: '#a94442' }}>
                  {i18next.t('????????????????????????????????????????????????')}
                </Flex>
              ) : null}
            </FormItem>
            <FormItem label={i18next.t('??????APP')}>
              <Flex className='form-control gm-border-0'>
                <Switch
                  type='primary'
                  checked={+appLimit === 1}
                  on={i18next.t('??????')}
                  off={i18next.t('??????')}
                  onChange={this.handleChangeAppLimit}
                  disabled={!can_edit_purchaser}
                />
              </Flex>
            </FormItem>
            <FormItem label={i18next.t('???????????????????????????')}>
              <Flex className='form-control gm-border-0'>
                <Switch
                  type='primary'
                  checked={+protocol_price === 1}
                  on={i18next.t('??????')}
                  off={i18next.t('??????')}
                  onChange={this.handleChangePrice}
                  disabled={!can_edit_purchaser}
                />
              </Flex>
            </FormItem>
            <FormItem
              label={i18next.t('??????')}
              required
              validate={Validator.create(
                [],
                name,
                this.checkName.bind(this, name),
              )}
            >
              <input
                type='text'
                name='name'
                className='form-control'
                value={name}
                disabled={!can_edit_purchaser}
                onChange={this.handleChange}
              />
            </FormItem>
            <FormItem label={i18next.t('?????????')}>
              <input
                type='number'
                name='phone'
                className='form-control'
                value={phone}
                disabled={!can_edit_purchaser}
                onChange={this.handlePhoneChange}
              />
            </FormItem>
            <FormItem label={i18next.t('???????????????')}>
              <MoreSelect
                disabled={!status || !can_edit_purchaser}
                multiple
                className='b-purchase-sourcer-detail-select'
                data={suppliers.slice()}
                selected={seleted_suppliers}
                onSelect={this.handleSupplierSelect}
                placeholder={i18next.t('???????????????')}
              />
            </FormItem>
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default PurchaseSourcerDetail
