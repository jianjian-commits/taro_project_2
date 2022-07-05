import React from 'react'
import { observer } from 'mobx-react'
import { isInShare, isValid } from '../../util'
import store from '../store/receipt_store'
import { Flex } from '@gmfe/react'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const PurchaseQuantityCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList } = store
  const { purchase_unit_quantity, purchase_unit, id } = data

  const handlePurchaseUnitQuantityChange = (value) => {
    const { ratio, tax_rate, unit_price } = data

    const changeData = {}

    // 入库数 (包装单位)
    changeData.purchase_unit_quantity = value

    // 入库数 (基本单位)
    changeData.quantity =
      isValid(value) && ratio ? +Big(value).times(ratio).toFixed(2) : null

    // 入库金额
    changeData.money =
      isValid(changeData.quantity) && isValid(unit_price)
        ? +Big(changeData.quantity).times(unit_price).toFixed(2)
        : null

    // 0 不能除
    if (changeData.quantity === 0) {
      changeData.purchase_unit_price = 0
    } else {
      changeData.purchase_unit_price =
        isValid(changeData.money) && isValid(changeData.purchase_unit_quantity)
          ? +Big(changeData.money)
              .div(changeData.purchase_unit_quantity)
              .toFixed(2)
          : null
    }

    // money改变需要重新算基本单位补差
    changeData.different_price =
      changeData.money && changeData.quantity && changeData.unit_price
        ? Big(changeData.money)
            .minus(Big(changeData.quantity).times(changeData.unit_price))
            .toFixed(2)
        : 0
    if (changeData.money !== null) {
      store.setChangeData(changeData, tax_rate)
    }
    store.changeStockInReceiptListItem(index, changeData)
  }

  return isInShare(stockInShareList, id) ? (
    `${purchase_unit_quantity}${purchase_unit}`
  ) : (
    <Flex alignCenter>
      <KCInputNumberV2
        value={purchase_unit_quantity}
        onChange={handlePurchaseUnitQuantityChange}
        precision={4}
        min={0}
        className='form-control input-sm'
        style={{ width: TABLE_X.WIDTH_NUMBER }}
      />
      <span className='gm-padding-5'>{purchase_unit || '-'}</span>
    </Flex>
  )
})

PurchaseQuantityCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(PurchaseQuantityCell)
