import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Tip } from '@gmfe/react'
import { TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import store from '../stores/store'
import global from 'stores/global'

const {
  OperationRowEdit,
  OperationCell: Operation,
  OperationDetail,
} = TableXUtil

const OperationCell = ({ index }) => {
  const { list, handleUpdateSplitSheet, paginationRef } = store
  const { isEditing, status, id } = list[index]

  const handleSetEditing = useCallback(() => {
    const { setListItemData } = store
    setListItemData(index, { isEditing: !isEditing, temporaryStatus: status })
  }, [index, isEditing, status])

  const handleSave = async () => {
    const { temporaryStatus } = list[index]
    await handleUpdateSplitSheet({ status: temporaryStatus, id })
    paginationRef.current.apiDoCurrentRequest()
    Tip.success(t('修改成功'))
  }

  return (
    <Operation>
      {status === 1 && global.hasPermission('edit_split_sheet') ? (
        <OperationRowEdit
          isEditing={isEditing}
          onClick={handleSetEditing}
          onCancel={handleSetEditing}
          onSave={handleSave}
        >
          <OperationDetail
            open
            href={`/#/sales_invoicing/processing_division/split_document/details?id=${id}`}
          />
        </OperationRowEdit>
      ) : (
        <OperationDetail
          open
          href={`/#/sales_invoicing/processing_division/split_document/details?id=${id}`}
        />
      )}
    </Operation>
  )
}

OperationCell.propTypes = {
  index: PropTypes.number.isRequired,
}

export default observer(OperationCell)
