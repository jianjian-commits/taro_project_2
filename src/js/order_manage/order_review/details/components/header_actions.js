import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Button, Flex, Dialog, Tip } from '@gmfe/react'

import Rejection from './rejection'
import store from '../store'
import { history } from 'common/service'

const HeaderActions = () => {
  const handleReject = () => {
    Dialog.confirm({
      title: t('审核驳回'),
      children: <Rejection />,
      onOK() {
        const { reason, id, handleUpdate, setReason } = store
        if (reason.length > 120) {
          Tip.warning(t('驳回原因不能超过120个字符'))
          setReason('')
          return
        }
        const params = {
          id,
          reason,
          update_audit_status: 3,
        }
        return handleUpdate(params).then(() => {
          Tip.success(t('驳回成功'))
          history.push('/order_manage/order_review/list')
        })
      },
    }).then(
      () => {},
      () => {
        const { setReason } = store
        setReason('')
      },
    )
  }

  const handleSuccess = () => {
    const { id, details, handleUpdate } = store
    const { skus } = details
    const params = {
      id,
      update_audit_status: 2,
      details: JSON.stringify(
        skus.map((sku) => ({
          sku_id: sku.sku_id,
          purchase_quantity: sku.purchase_quantity,
          remark: sku.remark,
        })),
      ),
    }
    return handleUpdate(params).then(() => {
      Tip.success(t('审核通过成功'))
      history.push('/order_manage/order_review/list')
    })
  }

  const {
    details: { audit_status },
  } = store

  return (
    audit_status === 1 && (
      <Flex>
        <Button onClick={handleReject}>{t('审核驳回')}</Button>
        <Button
          className='gm-margin-left-10'
          type='primary'
          onClick={handleSuccess}
        >
          {t('审核通过')}
        </Button>
      </Flex>
    )
  )
}

export default observer(HeaderActions)
