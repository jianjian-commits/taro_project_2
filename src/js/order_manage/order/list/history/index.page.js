/*
 * @Autor: xujiahao
 * @Date: 2021-12-07 15:41:48
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-12-07 16:28:32
 * @FilePath: /gm_static_stationv2/src/js/order_manage/order/list/history/index.page.js
 */
import React from 'react'
import ViewOrder from '../../../../order/view_order/index'
import { WithBreadCrumbs } from 'common/service'
import { t } from 'gm-i18n'
const OrderHistory = (props) => {
  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('历史数据')]} />
      <ViewOrder location='' type='history' />
    </>
  )
}
export default OrderHistory
