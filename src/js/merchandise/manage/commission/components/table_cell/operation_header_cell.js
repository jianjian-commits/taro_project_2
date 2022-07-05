import React from 'react'
import PropTypes from 'prop-types'
import memoComponentWithDataHoc from '../memo_component_with_data_hoc'
import { TableXUtil } from '@gmfe/table-x'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from '../goods_store'

const { EditOperation } = TableXUtil

const OperationHeaderCell = observer((props) => {
  const { onAddRow, index, data } = props

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    // 删除的时候需要将selected去掉该行数据
    const currentSelected = _.filter(store.skusListSelected, (item) => {
      return item !== data.id
    })

    store.changeSkusListSelected(currentSelected)
    store.deleteSkusListItem(index)

    if (store.skus.length === 0) {
      // 添加一行新的空行
      onAddRow(0)
    }
  }

  return <EditOperation onAddRow={handleAdd} onDeleteRow={handleDel} />
})

OperationHeaderCell.propTypes = {
  data: PropTypes.object.isRequired,
  onAddRow: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(OperationHeaderCell)
