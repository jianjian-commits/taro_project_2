import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import { Flex, Button } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import PropTypes from 'prop-types'
import globalStore from '../../stores/global'

import '../actions'
import '../reducer'
import actions from '../../actions'
import styles from '../product.module.less'

class RefundStockPrint extends React.Component {
  componentDidMount() {
    const reqData = { ...this.props.location.query }

    actions.product_refund_product_print_detail(reqData)
  }

  render() {
    const { printList } = this.props.product.refundStock
    return (
      <>
        {_.map(printList, (item, index) => {
          return <RefundStockPrintItem data={item} index={index} />
        })}
      </>
    )
  }
}

RefundStockPrint.propTypes = {
  product: PropTypes.object,
}

class RefundStockPrintItem extends React.Component {
  handlePrint = () => {
    window.print()
  }

  render() {
    const { data, index } = this.props
    const { details } = data
    let total_quantity = 0

    const productPanel = _.map(details, (p, index) => {
      total_quantity = Big(total_quantity).plus(p.quantity || 0)
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{p.id}</td>
          <td>{p.name}</td>
          <td>{i18next.t('商品描述')}</td>
          <td>{p.std_unit}</td>
          <td>{p.quantity}</td>
          <td>{p.unit_price}</td>
          <td>{p.money}</td>
          <td>{p.return_money_no_tax}</td>
          <td>{_.isNil(p.tax_rate) ? '-' : `${Big(p.tax_rate).div(100)}%`}</td>
          <td>{p.tax_money}</td>
          <td>{p.spu_remark}</td>
        </tr>
      )
    })

    return (
      <div
        className={'gm-margin-lr-15 ' + styles.print}
        style={{ pageBreakAfter: 'always' }} // 分页符
      >
        {index === 0 && (
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
        )}
        <Flex column alignCenter>
          {globalStore.isXNN() ? (
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {i18next.t('深圳市小农女供应链有限公司')}
            </div>
          ) : null}
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {i18next.t('退货单')}
          </div>
        </Flex>
        <div className='gm-gap-10' />
        <table className='table table-hover table-bordered gm-bg'>
          <tbody>
            <tr>
              <td colSpan='5'>
                {i18next.t('单据日期')}:&nbsp;{data.submit_time}
              </td>
              <td colSpan='7'>
                {i18next.t('单据编号')}: &nbsp;{data.id}
              </td>
            </tr>
            <tr>
              <td colSpan='5'>
                {i18next.t('往来单位')}:&nbsp;{data.supplier_name}
              </td>
              <td colSpan='7'>{i18next.t('供应商税号')}:</td>
            </tr>
            <tr>
              <td colSpan='3'>{i18next.t('单据摘要')}:</td>
              <td colSpan='3'>
                {i18next.t('单据备注')}:&nbsp;
                {data.return_sheet_remark}
              </td>
              <td colSpan='6'>{i18next.t('库房')}:</td>
            </tr>
            <tr>
              <td>{i18next.t('序号')}</td>
              <td>{i18next.t('商品编号')}</td>
              <td>{i18next.t('商品名称')}</td>
              <td>{i18next.t('商品描述')}</td>
              <td>{i18next.t('单位')}</td>
              <td>{i18next.t('数量')}</td>
              <td>{i18next.t('退货单价')}</td>
              <td>{i18next.t('退货金额')}</td>
              <td>{i18next.t('退货金额(不含税)')}</td>
              <td>{i18next.t('税率')}</td>
              <td>{i18next.t('税额')}</td>
              <td>{i18next.t('商品备注')}</td>
            </tr>
            {productPanel}
            <tr>
              <td colSpan='5' style={{ textAlign: 'right' }}>
                {i18next.t('页小计')}
              </td>
              <td>{total_quantity.toFixed(2)}</td>
              <td />
              <td colSpan='5'>{data.sku_money}</td>
            </tr>
            <tr>
              <td colSpan='3' style={{ textAlign: 'right' }}>
                {i18next.t('商品数量')}:&nbsp;{details.length}
              </td>
              <td colSpan='2' style={{ textAlign: 'right' }}>
                {i18next.t('整单折让')}: &nbsp;{data.delta_money}
              </td>
              <td colSpan='7' style={{ textAlign: 'right' }}>
                {i18next.t('成交金额')}: &nbsp;
                {Big(data.delta_money || 0)
                  .plus(data.sku_money || 0)
                  .toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan='5'>{i18next.t('仓库(签字)')}:</td>
              <td colSpan='7'>{i18next.t('供应商签字')}:</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

RefundStockPrintItem.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default connect((state) => ({
  product: state.product,
}))(RefundStockPrint)
