/**
 * @description: 渲染【操作】单元格
 */
import React from 'react'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { EditOperation } = TableXUtil

function RenderOperate(props) {
  const { index, rowsSize, disabled, onAddRow, onDeleteRow } = props

  if (rowsSize > 1 && index < rowsSize - 1) {
    return <EditOperation />
  }
  let onOperateAddRow
  let onOperateDeleteRow
  if (!disabled) {
    onOperateAddRow = onAddRow
  }
  if (!disabled && rowsSize > 1 && index === rowsSize - 1) {
    onOperateDeleteRow = onDeleteRow
  }
  return (
    <EditOperation
      onAddRow={onOperateAddRow}
      onDeleteRow={onOperateDeleteRow}
    />
  )
}
RenderOperate.propTypes = {
  index: PropTypes.number.isRequired,
  rowsSize: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  onAddRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
}

export default RenderOperate
