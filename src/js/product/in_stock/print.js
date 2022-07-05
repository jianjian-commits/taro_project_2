import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Button } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'

import '../actions'
import '../reducer'
import actions from '../../actions'
import styles from '../product.module.less'
import globalStore from '../../stores/global'

class InStockPrint extends React.Component {
  constructor(props) {
    super(props)
    this.handlePrint = ::this.handlePrint
  }

  componentDidMount() {
    actions.product_in_stock_detail(this.props.params.id)
  }

  handlePrint() {
    window.print()
  }

  render() {
    const { inStockDetail } = this.props.product
    const { details } = inStockDetail
    let total_quantity = 0

    const productPanel = _.map(details, (p, index) => {
      total_quantity = Big(total_quantity).plus(p.quantity)
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{p.id}</td>
          <td>{p.name}</td>
          <td>{p.desc}</td>
          <td>{p.std_unit}</td>
          <td>{p.quantity}</td>
          <td>{p.unit_price}</td>
          <td>{Big(p.money).toFixed(2)}</td>
          <td>{p.remark}</td>
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
          {globalStore.isXNN() ? (
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
              {i18next.t('深圳市小农女供应链有限公司')}
            </div>
          ) : null}
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {i18next.t('进货单')}
          </div>
        </Flex>
        <div className='gm-gap-10' />
        <table className='table table-hover table-bordered gm-bg'>
          <tbody>
            <tr>
              <td colSpan='5'>
                {i18next.t('单据日期')}:&nbsp;{inStockDetail.submit_time}
              </td>
              <td colSpan='4'>
                {i18next.t('单据编号')}: &nbsp;{inStockDetail.id}
              </td>
            </tr>
            <tr>
              <td colSpan='5'>
                {i18next.t('往来单位')}:&nbsp;{inStockDetail.supplier_name}
              </td>
              <td colSpan='4'>{i18next.t('供应商税号')}:</td>
            </tr>
            <tr>
              <td colSpan='6'>{i18next.t('单据摘要')}:</td>
              <td colSpan='3'>{i18next.t('库房')}:</td>
            </tr>
            <tr>
              <td>{i18next.t('批次号')}</td>
              <td>{i18next.t('商品编号')}</td>
              <td>{i18next.t('商品名称')}</td>
              <td>{i18next.t('商品描述')}</td>
              <td>{i18next.t('单位')}</td>
              <td>{i18next.t('数量')}</td>
              <td>{i18next.t('入库单价')}</td>
              <td>{i18next.t('入库金额')}</td>
              <td>{i18next.t('商品备注')}</td>
            </tr>
            {productPanel}
            <tr>
              <td colSpan='5' style={{ textAlign: 'right' }}>
                {i18next.t('页小计')}
              </td>
              <td colSpan='2'>{total_quantity.toFixed(2)}</td>
              <td colSpan='2'>{inStockDetail.sku_money || 0}</td>
            </tr>
            <tr>
              <td colSpan='5'>
                {i18next.t('单据备注')}:&nbsp;{inStockDetail.remark}
              </td>
              <td colSpan='2' style={{ textAlign: 'right' }}>
                {i18next.t('整单折让')}: &nbsp;{inStockDetail.delta_money || 0}
              </td>
              <td colSpan='2' style={{ textAlign: 'right' }}>
                {i18next.t('成交金额')}: &nbsp;
                {Big(inStockDetail.delta_money || 0)
                  .plus(inStockDetail.sku_money || 0)
                  .toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan='5'>{i18next.t('仓库(签字)')}:</td>
              <td colSpan='4'>{i18next.t('供应商签字')}:</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default InStockPrint
