/*
 * @Autor: xujiahao
 * @Date: 2021-05-14 10:18:40
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-11-11 14:17:35
 * @FilePath: /gm_static_stationv2/src/js/sales_invoicing/stock_in/product/component/money_cell.js
 */
import React from 'react'
import { observer } from 'mobx-react'
import { isInShare, isValid } from '../../util'
import store from '../store/receipt_store'
import { Flex, Price } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const MoneyCell = observer((props) => {
  const { stockInShareList } = store
  const { index, data } = props
  const { money, id } = data

  const handleMoneyChange = (value) => {
    const { quantity, purchase_unit_quantity, tax_rate } = data
    const changeData = {}
    changeData.money = value

    if (quantity === 0) {
      changeData.unit_price = 0
    } else {
      changeData.unit_price =
        isValid(value) && quantity ? +Big(value).div(quantity).toFixed(2) : null

      changeData.different_price =
        value && quantity && changeData.unit_price
          ? Big(value)
              .minus(Big(quantity).times(changeData.unit_price))
              .toFixed(2)
          : 0
    }

    if (purchase_unit_quantity === 0) {
      changeData.purchase_unit_price = 0
    } else {
      changeData.purchase_unit_price =
        isValid(value) && purchase_unit_quantity
          ? +Big(value).div(purchase_unit_quantity).toFixed(2)
          : null
    }
    changeData.instock_money_no_tax = Big(value || 0).div(
      Big(tax_rate || 0)
        .div(10000)
        .plus(1),
    )
    changeData.tax_money = Big(value || 0)
      .times(Big(tax_rate || 0).div(10000))
      .div(
        Big(tax_rate || 0)
          .div(10000)
          .plus(1),
      )
    store.changeStockInReceiptListItem(index, changeData)
  }

  return isInShare(stockInShareList, id) ? (
    money + Price.getUnit()
  ) : (
    <Flex alignCenter>
      <KCInputNumberV2
        value={money}
        autocomplete='off'
        id={index}
        onChange={handleMoneyChange}
        min={0}
        className='form-control input-sm'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
      />
      <span className='gm-padding-5'>{Price.getUnit()}</span>
    </Flex>
  )
})

MoneyCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(MoneyCell)
