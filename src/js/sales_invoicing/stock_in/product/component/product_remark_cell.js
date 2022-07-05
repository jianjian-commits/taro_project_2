import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { KCInput } from '@gmfe/keyboard'
import { isInShare } from '../../util'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'

const ProductRemarkCell = observer((props) => {
  const { index, data } = props
  const { stockInShareList } = store
  const { remark, id } = data

  const handleRemarkChange = (e) => {
    const { value } = e.target
    const changeData = {}

    changeData.remark = value

    store.changeStockInReceiptListItem(index, changeData)
  }

  return isInShare(stockInShareList, id) ? (
    remark
  ) : (
    <KCInput
      style={{ width: '100px' }}
      maxLength={30}
      type='text'
      value={remark || ''}
      className='form-control input-sm'
      onChange={handleRemarkChange}
    />
  )
})

ProductRemarkCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ProductRemarkCell)
