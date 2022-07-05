import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_with_data_hoc'
import { TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'
import store from '../store'

const { EditOperation } = TableXUtil

const OperationHeaderCell = observer((props) => {
  const { onAddRow, index } = props

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    store.changeEditTask(true)
    store.deleteListItem(index)
  }

  return <EditOperation onAddRow={handleAdd} onDeleteRow={handleDel} />
})

OperationHeaderCell.propTypes = {
  data: PropTypes.object.isRequired,
  onAddRow: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(OperationHeaderCell)
