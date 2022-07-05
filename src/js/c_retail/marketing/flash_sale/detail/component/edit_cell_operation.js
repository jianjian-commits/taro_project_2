import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_hoc'
import { TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'
import store from '../store'

const { EditOperation } = TableXUtil

const OperationHeaderCell = observer(props => {
  const { onAddRow, index } = props

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    // 只剩一个，并且有数据的情况下，删除默认添加一个
    if (skus.length === 1 && !!skus[0].sku_id) {
      store.deleteListItem(index)
      store.addListItem()
    } else {
      store.deleteListItem(index)
    }
  }
  const { skus } = store.detail
  return (
    <EditOperation
      onAddRow={handleAdd}
      onDeleteRow={skus.length === 1 && !skus[0].sku_id ? undefined : handleDel}
    />
  )
})

OperationHeaderCell.propTypes = {
  data: PropTypes.object.isRequired,
  onAddRow: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired
}

export default memoComponentWithDataHoc(OperationHeaderCell)
