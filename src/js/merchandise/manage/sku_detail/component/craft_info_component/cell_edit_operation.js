import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from './memo_hoc'
import { TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'
import skuStore from '../../sku_store'

const { EditOperation } = TableXUtil

const CellEditOperation = observer((props) => {
  const { onAddRow, index } = props

  return (
    <EditOperation
      onAddRow={onAddRow}
      onDeleteRow={() => skuStore.deleteIngredient(index)}
    />
  )
})

CellEditOperation.propTypes = {
  index: PropTypes.number.isRequired,
  onAddRow: PropTypes.func.isRequired,
}

export default memoComponentWithDataHoc(CellEditOperation)
