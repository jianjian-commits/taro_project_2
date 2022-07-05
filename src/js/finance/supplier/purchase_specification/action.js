import React from 'react'
import { i18next } from 'gm-i18n'
import { TableUtil } from '@gmfe/table'
import PropTypes from 'prop-types'
import globalStore from '../../../stores/global'

const Action = ({
  index,
  isEditing,
  original: item,
  onModify,
  onSave,
  onDetail,
  onDelete,
  onPrint,
  onCancel,
}) => {
  const { bind, barcode, id } = item
  const content =
    +bind === 1
      ? i18next.t('采购规格已绑定销售商品，是否继续删除操作')
      : i18next.t('确认要删除采购规格')
  const canEdit = globalStore.hasPermission('edit_pur_spec')
  const items = (
    <>
      {!!barcode && (
        <span className='gm-padding-5' onClick={() => onPrint(item)}>
          <i className='gm-text-16 xfont xfont-print gm-text-hover-primary gm-cursor' />
        </span>
      )}
      {globalStore.hasPermission('get_quote_price') && (
        <TableUtil.OperationDetail
          onClick={() => {
            onDetail(item)
          }}
        />
      )}
      {globalStore.hasPermission('delete_pur_spec') && (
        <TableUtil.OperationDelete
          title='删除采购规格'
          onClick={() => {
            onDelete(item)
          }}
        >
          {content}
        </TableUtil.OperationDelete>
      )}
    </>
  )
  return canEdit ? (
    <TableUtil.OperationRowEdit
      isEditing={!!isEditing}
      onClick={() => {
        onModify('isEditing', index, true)
      }}
      onCancel={onCancel}
      onSave={() => {
        onSave(id, index)
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
  onPrint: PropTypes.func,
  onCancel: PropTypes.func,
  isEditing: PropTypes.bool,
}

export default Action
