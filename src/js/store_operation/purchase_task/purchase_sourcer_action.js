import React from 'react'
import { i18next } from 'gm-i18n'
import { TableUtil } from '@gmfe/table'
import _ from 'lodash'
import PropTypes from 'prop-types'
import globalStore from '../../stores/global'

const Action = ({ index, original, onModify, onSave, onDetail, onDelete }) => {
  const {
    id,
    isEditing,
    settle_suppliers,
    settle_suppliers_be,
    status,
  } = original
  const can_delete_purchaser = globalStore.hasPermission('delete_purchaser')
  const can_edit_purchaser = globalStore.hasPermission('edit_purchaser')
  const items = (
    <>
      <TableUtil.OperationDetail onClick={() => onDetail(id)} />
      {can_delete_purchaser && (
        <TableUtil.OperationDelete title='警告' onClick={() => onDelete(id)}>
          {i18next.t('将解除此采购员与供应商的绑定关系，确定删除吗？')}
        </TableUtil.OperationDelete>
      )}
    </>
  )
  return status && can_edit_purchaser ? (
    <TableUtil.OperationRowEdit
      isEditing={!!isEditing}
      onClick={() => {
        onModify(index, 'isEditing', true)
      }}
      onCancel={() => {
        onModify(index, 'isEditing', false)
        onModify(index, 'settle_suppliers', settle_suppliers_be)
      }}
      onSave={() => {
        onSave(
          id,
          _.map(settle_suppliers, (item) => item.value)
        )
      }}
    >
      {items}
    </TableUtil.OperationRowEdit>
  ) : (
    <TableUtil.OperationCell>{items}</TableUtil.OperationCell>
  )
}

Action.propTypes = {
  original: PropTypes.object,
  index: PropTypes.number,
  onModify: PropTypes.func,
  onSave: PropTypes.func,
  onDetail: PropTypes.func,
  onDelete: PropTypes.func,
}

export default Action
