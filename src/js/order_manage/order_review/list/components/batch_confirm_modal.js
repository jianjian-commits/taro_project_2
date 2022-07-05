import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Form, FormItem, Select } from '@gmfe/react'

import store from '../store'
import { auditActionStatusEnum } from 'common/enum'

const CONFIRM_STATUS = []

auditActionStatusEnum.forEach((value, key) => {
  if (key !== 1) CONFIRM_STATUS.push({ value: key, text: value })
})

const BatchConfirmModal = () => {
  const { updateParams } = store
  const { update_audit_status, reason } = updateParams

  useEffect(() => {
    return () => {
      const { mergeUpdateParams } = store
      mergeUpdateParams({ update_audit_status: 2, reason: '' })
    }
  }, [])

  const handleChange = (value, key) => {
    const { mergeUpdateParams } = store
    mergeUpdateParams({ [key]: value })
  }

  return (
    <Form labelWidth='90px' colWidth='380px'>
      <FormItem label={t('审核')} required>
        <Select
          onChange={(value) => handleChange(value, 'update_audit_status')}
          data={CONFIRM_STATUS}
          value={update_audit_status}
        />
      </FormItem>
      {update_audit_status === 3 && (
        <FormItem label={t('驳回原因')}>
          <textarea
            cols={6}
            value={reason}
            onChange={(event) => handleChange(event.target.value, 'reason')}
          />
        </FormItem>
      )}
    </Form>
  )
}

export default observer(BatchConfirmModal)
