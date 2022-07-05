import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'

import { formatPostData } from 'common/util'

function formatSubmatData(params = {}) {
  const newParams = { ...params }
  const {
    task_scope,
    alloc_type,
    spu_ids,
    address_kind,
    route_address_ids = [],
    merchant_address_ids = [],
  } = newParams
  const deletePropNamesArr = []
  if (task_scope === 1) {
    deletePropNamesArr.push(
      ...['alloc_type', 'spu_ids', 'address_ids', 'address_kind'],
    )
  } else {
    if (alloc_type === 1) {
      if (!spu_ids?.length) {
        Tip.warning(t('请选择商品'))
        return
      }
      deletePropNamesArr.push('address_ids', 'address_kind')
      newParams.spu_ids = JSON.stringify(spu_ids)
    } else {
      deletePropNamesArr.push('spu_ids')
      const isRoute = address_kind === 1
      const address_ids = isRoute ? route_address_ids : merchant_address_ids
      if (!address_ids?.length) {
        Tip.warning(t(isRoute ? '请按路线选择商户' : '请按商户标签选择商户'))
        return
      }
      newParams.address_ids = address_ids
    }
  }
  return formatPostData(newParams, deletePropNamesArr)
}

export { formatSubmatData }
