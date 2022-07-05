import React from 'react'
import PropTypes from 'prop-types'
import planMemoComponentWithDataHoc from './plan_memo_component_with_data_hoc'
import { TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'
import store from '../store'

const { EditOperation } = TableXUtil

const OperationHeaderCell = observer((props) => {
  const { onAddRow, index } = props
  const { processPlanList } = store
  const delDisable = processPlanList.length === 1

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    store.delProcessPlanListItem(index)
  }

  return (
    <EditOperation
      onAddRow={handleAdd}
      onDeleteRow={delDisable ? undefined : handleDel}
    />
  )
})

OperationHeaderCell.propTypes = {
  onAddRow: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
}

export default planMemoComponentWithDataHoc(OperationHeaderCell)
