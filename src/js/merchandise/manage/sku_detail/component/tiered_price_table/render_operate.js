import React from 'react'
import PropTypes from 'prop-types'
import { TableUtil } from '@gmfe/table'

const { EditTableOperation } = TableUtil

function RenderOperate(props) {
  const { index, onAddRow, onDeleteRow, rowsSize } = props

  if (rowsSize > 1 && index < rowsSize - 1) {
    return <EditTableOperation />
  }
  const onOperateAddRow = onAddRow
  let onOperateDeleteRow
  if (rowsSize > 1 && index === rowsSize - 1) {
    onOperateDeleteRow = onDeleteRow
  }
  return (
    <EditTableOperation
      onAddRow={onOperateAddRow}
      onDeleteRow={onOperateDeleteRow}
    />
  )
}
RenderOperate.propTypes = {
  index: PropTypes.number.isRequired,
  rowsSize: PropTypes.number.isRequired,
  onAddRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
}

export default RenderOperate
