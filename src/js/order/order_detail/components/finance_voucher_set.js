import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormItem,
  FormButton,
  Validator,
  Modal,
  Button,
} from '@gmfe/react'
import { openNewTab } from '../../../common/util'
import PropTypes from 'prop-types'
import { Storage } from '@gmfe/react'

class FinanceVouCherSet extends React.Component {
  constructor(props) {
    super(props)
    this.state = Storage.get('finance_printer_setting') || {
      printHead: '',
      CapitalPrefix: '',
      LowercasePrefix: '',
    }

    this.handleChange = ::this.handleChange
    this.handleSubmit = ::this.handleSubmit
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleSubmit() {
    const { _id, isSelectAll } = this.props
    console.log('this.state', this.state, this.props._id)
    openNewTab(
      `#/system/setting/finance_voucher_printer/print?order_id=${JSON.stringify(
        _id,
      )}&financeVoucherPrintSet=${JSON.stringify(
        this.state,
      )}&isSelectAll=${isSelectAll}`,
    )
    Storage.set('finance_printer_setting', this.state)
  }

  handleCancel(e) {
    e.preventDefault()
    Modal.hide()
  }

  render() {
    const { CapitalPrefix, LowercasePrefix, printHead } = this.state
    return (
      <div>
        <Form disabledCol onSubmitValidated={this.handleSubmit}>
          <FormItem
            label={i18next.t('设置打印抬头')}
            // required
            validate={Validator.create([], printHead)}
          >
            <input
              type='text'
              value={printHead}
              onChange={this.handleChange}
              name='printHead'
            />
          </FormItem>
          <FormItem
            label={i18next.t('设置大写前缀')}
            // required
            validate={Validator.create([], CapitalPrefix)}
          >
            <input
              type='text'
              value={CapitalPrefix}
              onChange={this.handleChange}
              name='CapitalPrefix'
            />
          </FormItem>
          <FormItem
            label={i18next.t('设置小写前缀')}
            // required
            validate={Validator.create([], LowercasePrefix)}
          >
            <input
              type='text'
              value={LowercasePrefix}
              name='LowercasePrefix'
              onChange={this.handleChange}
            />
          </FormItem>
          <FormButton>
            <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
            <span className='gm-gap-5' />
            <Button type='primary' htmlType='submit'>
              {i18next.t('打印')}
            </Button>
          </FormButton>
        </Form>
      </div>
    )
  }
}
FinanceVouCherSet.propTypes = {
  _id: PropTypes.string.isRequired,
  isSelectAll: PropTypes.bool,
}
export default FinanceVouCherSet
