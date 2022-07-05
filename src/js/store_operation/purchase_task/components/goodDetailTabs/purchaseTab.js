import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Sheet, SheetColumn, Price, ToolTip } from '@gmfe/react'
import { money, getPurchaseSheetStatus } from '../../../../common/filter'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'

class PurchaseTab extends React.Component {
  render() {
    let list = this.props.purchaseHistory
    let already_purchase = 0
    let already_in_stock = 0
    let already_purchase_price = 0
    let already_in_stock_price = 0
    let std_unit_name

    // 判断是否从pc客户端进入的,pc客户端就不新开
    const is_electron = window.navigator.userAgent.includes('Electron') && true

    _.forEach(list, (item) => {
      let purchase_amount = item.purchase_amount ? item.purchase_amount : 0
      let in_stock_amount = item.in_stock_amount ? item.in_stock_amount : 0
      let purchase_unit_price = item.purchase_unit_price
        ? item.purchase_unit_price
        : 0
      let in_stock_unit_price = item.in_stock_unit_price
        ? item.in_stock_unit_price
        : 0

      std_unit_name = item.std_unit_name
      already_purchase = Big(already_purchase).plus(purchase_amount)
      already_in_stock = Big(already_in_stock).plus(in_stock_amount)
      already_purchase_price = Big(already_purchase_price).plus(
        Big(purchase_amount).times(purchase_unit_price).div(100)
      )
      already_in_stock_price = Big(already_in_stock_price).plus(
        Big(in_stock_amount).times(in_stock_unit_price).div(100)
      )
    })
    return (
      <Flex column>
        <Flex row className='gm-padding-tb-10'>
          <Flex row justifyCenter alignCenter flex>
            <Flex
              column
              alignCenter
              flex
              className='gm-back-bg gm-padding-tb-10'
            >
              <Flex alignCenter>
                <i
                  className={`xfont xfont-order-circle gm-text-14`}
                  style={{ color: '#02a6f4', paddingRight: '2px' }}
                />
                {i18next.t('已采购')}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '120px' }}>
                      {i18next.t('汇总已提交采购单据的采购数')}
                    </div>
                  }
                  className='gm-margin-left-5'
                />
              </Flex>
              <div>
                {Big(already_purchase).toFixed(2)}
                {std_unit_name}
              </div>
            </Flex>
            <Flex
              column
              alignCenter
              flex
              className='gm-back-bg gm-padding-tb-10'
            >
              <Flex alignCenter>
                <i
                  className={`xfont xfont-down-in-circle gm-text-14`}
                  style={{ color: '#ffd100', paddingRight: '2px' }}
                />
                {i18next.t('已入库')}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '120px' }}>
                      {i18next.t('汇总已提交入库单据的入库数')}
                    </div>
                  }
                  className='gm-margin-left-5'
                />
              </Flex>
              <div>
                {Big(already_in_stock).toFixed(2)}
                {std_unit_name}
              </div>
            </Flex>
          </Flex>
          <div className='gm-gap-5' />
          <Flex row justifyCenter alignCenter flex>
            <Flex
              column
              alignCenter
              flex
              className='gm-back-bg gm-padding-tb-10'
            >
              <Flex alignCenter>
                <i
                  className={`xfont xfont-price-circle gm-text-14`}
                  style={{ color: '#fb3737', paddingRight: '2px' }}
                />
                {i18next.t('已采金额')}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '120px' }}>
                      {i18next.t('汇总已提交采购单据的采购金额')}
                    </div>
                  }
                  className='gm-margin-left-5'
                />
              </Flex>
              <div>
                {Big(already_purchase_price).toFixed(2)}
                {Price.getUnit()}
              </div>
            </Flex>
            <Flex
              column
              alignCenter
              flex
              className='gm-back-bg gm-padding-tb-10'
            >
              <Flex alignCenter>
                <i
                  className={`xfont xfont-price-circle gm-text-14`}
                  style={{ color: '#5ebc5e', paddingRight: '2px' }}
                />
                {i18next.t('已入金额')}
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '120px' }}>
                      {i18next.t('汇总已提交入库单据的入库金额')}
                    </div>
                  }
                  className='gm-margin-left-5'
                />
              </Flex>
              <div>
                {Big(already_in_stock_price).toFixed(2)}
                {Price.getUnit()}
              </div>
            </Flex>
          </Flex>
        </Flex>
        <Sheet list={list} enableEmptyTip={i18next.t('没有记录')}>
          <SheetColumn field='purchase_time' name={i18next.t('创建时间')}>
            {(purchase_time) =>
              moment(purchase_time).format('YYYY-MM-DD HH:mm:ss')
            }
          </SheetColumn>
          <SheetColumn field='purchase_sheet_id' name={i18next.t('采购单据')}>
            {(purchase_sheet_id) => {
              return (
                <a
                  href={`#/supply_chain/purchase/bills/detail?id=${purchase_sheet_id}`}
                  target='_blank'
                >
                  {purchase_sheet_id}
                </a>
              )
            }}
          </SheetColumn>
          <SheetColumn field='status' name={i18next.t('状态')}>
            {(status) => {
              return getPurchaseSheetStatus(status) || '-'
            }}
          </SheetColumn>
          <SheetColumn field='purchase_amount' name={i18next.t('采购数量')}>
            {(purchase_amount, index) => {
              return `${Big(purchase_amount).valueOf()}${
                list[index].std_unit_name
              }`
            }}
          </SheetColumn>
          <SheetColumn field='purchase_unit_price' name={i18next.t('采购价格')}>
            {(purchase_unit_price, index) => {
              return `${money(purchase_unit_price)}${Price.getUnit() + '/'}${
                list[index].std_unit_name
              }`
            }}
          </SheetColumn>
          <SheetColumn field='in_stock_sheet_id' name={i18next.t('入库单号')}>
            {(in_stock_sheet_id) => {
              return in_stock_sheet_id ? (
                <a
                  href={`#/sales_invoicing/stock_in/product/detail?id=${in_stock_sheet_id}`}
                  target={is_electron ? '_self' : '_blank'}
                >
                  {in_stock_sheet_id}
                </a>
              ) : (
                '-'
              )
            }}
          </SheetColumn>
          <SheetColumn field='in_stock_amount' name={i18next.t('入库数')}>
            {(in_stock_amount, index) => {
              return in_stock_amount
                ? `${in_stock_amount}${list[index].std_unit_name}`
                : '-'
            }}
          </SheetColumn>
          <SheetColumn field='in_stock_unit_price' name={i18next.t('入库价')}>
            {(in_stock_unit_price, index) => {
              return in_stock_unit_price
                ? `${money(in_stock_unit_price)}${Price.getUnit() + '/'}${
                    list[index].std_unit_name
                  }`
                : '-'
            }}
          </SheetColumn>
        </Sheet>
      </Flex>
    )
  }
}

PurchaseTab.propTypes = {
  purchaseHistory: PropTypes.array,
}

PurchaseTab.defaultProps = {
  purchaseHistory: [],
}

export default PurchaseTab
