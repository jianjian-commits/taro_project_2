import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from '../common/memo_component_with_data_hoc'
import { TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'

const { EditOperation } = TableXUtil

const OperationHeaderCell = observer((props) => {
  const { onAddRow, index, data, onDelRow } = props

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    onDelRow(index, data)
  }

  return <EditOperation onAddRow={handleAdd} onDeleteRow={handleDel} />
})

OperationHeaderCell.propTypes = {
  data: PropTypes.object.isRequired,
  onAddRow: PropTypes.func.isRequired,
  onDelRow: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(OperationHeaderCell, 'two')
