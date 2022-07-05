import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import { Flex, Button } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import './actions'
import './reducer'
import actions from '../../actions'
import styles from './style.module.less'

class SettleSheetPrint extends React.Component {
  constructor(props) {
    super(props)
    this.handlePrint = ::this.handlePrint
  }

  componentDidMount() {
    actions.payment_review_print_settle_sheet_detail(this.props.params.id)
  }

  handlePrint() {
    window.print()
  }

  render() {
    const { print_settle_sheet_detail } = this.props.payment_review
    const { sub_sheets } = print_settle_sheet_detail
    let total_money = 0

    const receiptPanel = _.map(sub_sheets, (r, index) => {
      total_money = Big(total_money).plus(r.sku_money).plus(r.delta_money)
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{r._id}</td>
          <td>
            {Big(r.sku_money || 0)
              .plus(r.delta_money)
              .div(100)
              .toFixed(2)}
          </td>
          <td colSpan='2'>
            {Big(r.sku_money || 0)
              .plus(r.delta_money)
              .div(100)
              .toFixed(2)}
          </td>
        </tr>
      )
    })

    return (
      <div className={'gm-margin-15 ' + styles.print}>
        <div style={{ position: 'relative' }}>
          <Button
            type='primary'
            className='hidden-print'
            style={{ position: 'absolute', top: '15px', right: '20px' }}
            onClick={this.handlePrint}
          >
            {i18next.t('打印')}
          </Button>
        </div>
        <Flex column alignCenter>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {i18next.t('付款单')}
          </div>
        </Flex>
        <div className='gm-gap-10' />
        <table className='table table-hover table-bordered gm-bg'>
          <tbody>
            <tr>
              <td colSpan='2'>
                {i18next.t('单据日期')}:&nbsp;
                {print_settle_sheet_detail.date_time}
              </td>
              <td colSpan='2'>
                {i18next.t('单据编号')}:&nbsp;{print_settle_sheet_detail.id}
              </td>
              <td colSpan='1'>{i18next.t('经手人')}:</td>
            </tr>
            <tr>
              <td colSpan='2'>
                {i18next.t('往来单位')}:&nbsp;
                {print_settle_sheet_detail.settle_supplier_name}
              </td>
              <td colSpan='2'>{i18next.t('供应商营业执照号')}:</td>
              <td colSpan='1'>{i18next.t('制单人')}:</td>
            </tr>
            <tr>
              <td
                colSpan='5'
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {i18next.t('付款信息')}
              </td>
            </tr>
            <tr>
              <td colSpan='2'>
                {i18next.t('开户银行')}:&nbsp;{print_settle_sheet_detail.bank}
              </td>
              <td colSpan='2'>
                {i18next.t('银行账号')}:&nbsp;
                {print_settle_sheet_detail.card_no}
              </td>
              <td colSpan='1'>
                {i18next.t('结款方式')}:&nbsp;
                {print_settle_sheet_detail.pay_method}
              </td>
            </tr>
            <tr>
              <td colSpan='5'>
                {i18next.t('开户名')}:&nbsp;
                {print_settle_sheet_detail.account_name}
              </td>
            </tr>
            <tr>
              <td colSpan='5'>
                {i18next.t('付款单摘要')}:&nbsp;
                {print_settle_sheet_detail.remark}
              </td>
            </tr>
            <tr>
              <td
                colSpan='5'
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {i18next.t('结款单据')}
              </td>
            </tr>
            <tr>
              <td>{i18next.t('行号')}</td>
              <td>{i18next.t('单据编号')}</td>
              <td>{i18next.t('金额')}</td>
              <td colSpan='2'>{i18next.t('结算金额')}</td>
            </tr>
            {receiptPanel}
            <tr>
              <td colSpan='2' style={{ textAlign: 'right' }}>
                {i18next.t('结款单据页小计')}
              </td>
              <td>{Big(total_money).div(100).toFixed(2)}</td>
              <td colSpan='2'>{Big(total_money).div(100).toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan='1'>{i18next.t('合计')}</td>
              <td colSpan='2' style={{ textAlign: 'right' }}>
                {i18next.t('整单折让')}: &nbsp;
                {Big(print_settle_sheet_detail.delta_money || 0)
                  .div(100)
                  .toFixed(2)}
              </td>
              <td colSpan='2' style={{ textAlign: 'right' }}>
                {i18next.t('合计金额')}: &nbsp;
                {Big(print_settle_sheet_detail.total_price || 0)
                  .plus(print_settle_sheet_detail.delta_money || 0)
                  .div(100)
                  .toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect((state) => ({
  payment_review: state.payment_review,
}))(SettleSheetPrint)
