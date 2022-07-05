import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from '@gmfe/react'
import Permission from 'common/components/permission'
import { TableUtil } from '@gmfe/table'

const { OperationDelete, OperationRowEdit } = TableUtil

const TableAction = ({
  original,
  onDelete,
  onEdit,
  onCancel,
  onSave,
  canEdit,
}) => {
  return (
    <Flex alignCenter justifyCenter>
      <>
        {canEdit ? (
          <OperationRowEdit
            isEditing={original._edit}
            onClick={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          >
            <Permission field='delete_turnover_loan_sheet'>
              <OperationDelete title={t('删除借出记录')} onClick={onDelete}>
                {t(
                  '确定删除吗？（如该借出记录来自订单，删除后订单中的周转物信息也将一并被删除）',
                )}
              </OperationDelete>
            </Permission>
          </OperationRowEdit>
        ) : (
          <Permission field='delete_turnover_loan_sheet'>
            <OperationDelete title={t('删除借出记录')} onClick={onDelete}>
              {t(
                '确定删除吗？（如该借出记录来自订单，删除后订单中的周转物信息也将一并被删除）',
              )}
            </OperationDelete>
          </Permission>
        )}
      </>
    </Flex>
  )
}

TableAction.propTypes = {
  index: PropTypes.number,
  canEdit: PropTypes.bool,
  original: PropTypes.object,
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
  onEdit: PropTypes.func,
  onCancel: PropTypes.func,
}

export default TableAction
