import React from 'react'
import Details from './components/details'
import { withBreadcrumbs } from 'common/service'
import { t } from 'gm-i18n'
import detailsStore from './store/details.store'
import { Tip } from '@gmfe/react'
import { history } from 'common/service'

const Create = () => {
  const handleOK = async () => {
    const { handleCreate, checkErrorData } = detailsStore
    try {
      const result = await handleCreate()
      Tip.success(t('创建成功'))
      history.push('/sales_invoicing/base/split_scheme')
      return result
    } catch ({ data: { deleted_spu_ids }, msg }) {
      Tip.warning(msg)
      checkErrorData(deleted_spu_ids)
    }
  }

  return <Details onOK={handleOK} title={t('新建分割方案')} />
}

export default withBreadcrumbs([t('新建分割方案')])(Create)
