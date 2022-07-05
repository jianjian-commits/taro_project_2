import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import { TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from '../store/receipt_store'
import { isInShare } from '../../util'

const { EditOperation } = TableXUtil

const OperationHeaderCell = observer((props) => {
  const { onAddRow, index, data } = props
  const { stockInShareList, stockInReceiptList } = store
  const delDisable =
    isInShare(stockInShareList, data.id) || stockInReceiptList.length === 1

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    // 删除的时候需要将selected去掉该行数据
    const currentSelected = _.filter(store.tableSelected, (item) => {
      return item !== data.uniqueKeyForSelect
    })

    store.changeTableSelect(currentSelected)
    store.deleteStockInReceiptListItem(index)
  }

  return (
    <EditOperation
      onAddRow={handleAdd}
      onDeleteRow={delDisable ? undefined : handleDel}
    />
  )
})

OperationHeaderCell.propTypes = {
  data: PropTypes.object.isRequired,
  onAddRow: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(OperationHeaderCell)
