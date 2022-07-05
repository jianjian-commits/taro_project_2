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

const PurchasePriceCell = observer((props) => {
  const { stockInShareList } = store
  const { index, data } = props
  const { purchase_unit_price, purchase_unit, id } = data

  const handlePurchaseUnitPriceChange = (value) => {
    const { purchase_unit_quantity, quantity, tax_rate } = data
    const changeData = {}

    changeData.purchase_unit_price = value

    changeData.money =
      isValid(value) && isValid(purchase_unit_quantity)
        ? +Big(value).times(purchase_unit_quantity).toFixed(2)
        : null

    changeData.unit_price =
      changeData.money && isValid(quantity)
        ? +Big(changeData.money).div(quantity).toFixed(2)
        : null

    // money改变需要重新算基本单位补差
    changeData.different_price =
      changeData.money && quantity && changeData.unit_price
        ? Big(changeData.money)
            .minus(Big(quantity).times(changeData.unit_price))
            .toFixed(2)
        : 0
    if (changeData.money !== null) {
      store.setChangeData(changeData, tax_rate)
    }
    store.changeStockInReceiptListItem(index, changeData)
  }

  return isInShare(stockInShareList, id) ? (
    `${purchase_unit_price}${purchase_unit}`
  ) : (
    <Flex alignCenter>
      <KCInputNumberV2
        value={purchase_unit_price}
        onChange={handlePurchaseUnitPriceChange}
        min={0}
        precision={2}
        className='form-control input-sm'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
      />
      <span className='gm-padding-5'>
        {Price.getUnit() + '/'}
        {purchase_unit || '-'}
      </span>
    </Flex>
  )
})

PurchasePriceCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(PurchasePriceCell)
