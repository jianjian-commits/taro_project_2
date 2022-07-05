import React from 'react'
import PropTypes from 'prop-types'
import MemoComponentHoc from './memo_component'
import { TableXUtil } from '@gmfe/table-x'
const { EditOperation } = TableXUtil

const OperationHeaderCell = (props) => {
  const { onAddRow, onDeleteRow } = props

  return <EditOperation onAddRow={onAddRow} onDeleteRow={onDeleteRow} />
}

const compare = (prevProps, nextProps) => {
  return prevProps.delDisable === nextProps.delDisable // 由于onDelete接受参数，先用这种方式取消render，需另外优化
}

OperationHeaderCell.propTypes = {
  onAddRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func,
  delDisable: PropTypes.bool,
}

export default MemoComponentHoc(OperationHeaderCell, compare)
