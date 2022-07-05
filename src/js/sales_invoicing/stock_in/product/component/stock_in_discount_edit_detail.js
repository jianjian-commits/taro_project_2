import React from 'react'
import { observer } from 'mobx-react'
import DiscountPanel from '../../../../common/components/discount_panel'
import store from '../store/receipt_store'
import {
  PRODUCT_ACTION_TYPE,
  PRODUCT_REASON_TYPE,
} from '../../../../common/enum'
import PropTypes from 'prop-types'

const StockInDiscountEditDetail = observer((props) => {
  const { stockInDiscountList } = store

  const handleDiscountAdd = (discount) => {
    store.addDiscountList(discount)
  }

  const handleDiscountDel = (index) => {
    store.deleteDiscountListItem(index)
  }

  return (
    <DiscountPanel
      list={stockInDiscountList.slice()}
      reasonMap={PRODUCT_REASON_TYPE}
      actionMap={PRODUCT_ACTION_TYPE}
      editable={props.type === 'add'}
      onAdd={handleDiscountAdd}
      onDel={handleDiscountDel}
    />
  )
})

StockInDiscountEditDetail.propTypes = {
  type: PropTypes.string.isRequired,
}

export default StockInDiscountEditDetail
