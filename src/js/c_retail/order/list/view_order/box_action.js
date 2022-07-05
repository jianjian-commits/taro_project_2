import { i18next } from 'gm-i18n'
import React from 'react'
import { FunctionSet, Tip, Modal, Button } from '@gmfe/react'
import moment from 'moment'

import BatchEditStatus from '../../../../order/view_order/edit_status'
import PresetAction from '../../../../order/view_order/preset_action'
import globalStore from 'stores/global'

import store from './store'

const BoxAction = (props) => {
  // 编辑订单状态
  const isStatusEditable = globalStore.hasPermission('edit_order_status')

  const { orders, selectedOrders } = store
  const { filter } = orders
  const ids = selectedOrders.selected.slice()

  const handleChangeSelectedOrders = (
    filter,
    count,
    status,
    to_status,
    remark
  ) => {
    store
      .orderStatusPresetUpdate(
        filter.start_date,
        filter.end_date,
        filter.start_date_new,
        filter.end_date_new,
        status,
        filter.orderInput || undefined,
        count,
        to_status,
        remark
      )
      .then(() => {
        store.doFirstRequest()
        Modal.hide()
      })
  }

  const handleChangeOrderStatus = () => {
    Modal.render({
      children: (
        <PresetAction
          filter={{
            start_date: moment(filter.begin),
            end_date: moment(filter.end),
            start_date_new: moment(filter.begin),
            end_date_new: moment(filter.end),
            from_status: filter.orderStatus,
            search_text: filter.orderInput,
          }}
          onChangeSelectedOrders={handleChangeSelectedOrders}
        />
      ),
      title: i18next.t('按预设数修改订单状态'),
      onHide: Modal.hide,
    })
  }

  const handleOrdersStatuChange = (orderStatus, remark) => {
    const {
      selectedOrders: { selected },
    } = store
    const ids = selected.slice()
    return store.orderStatusUpdate(orderStatus, ids, remark)
  }

  const handleChangeSelectedOrderStatus = () => {
    if (ids.length === 0) {
      Tip.warning(i18next.t('没有选择订单'))
      return
    }

    Modal.render({
      children: (
        <BatchEditStatus
          onOrdersStatuChange={handleOrdersStatuChange}
          selectedOrders={selectedOrders}
        />
      ),
      title: i18next.t('修改选中订单状态'),
      onHide: Modal.hide,
    })
  }

  return (
    isStatusEditable && (
      <FunctionSet
        data={[
          {
            text: i18next.t('修改选中订单'),
            onClick: handleChangeSelectedOrderStatus,
          },
          {
            text: i18next.t('按预设数修改'),
            onClick: handleChangeOrderStatus,
          },
        ]}
        right
      >
        <Button type='primary'>{i18next.t('修改状态')}</Button>
      </FunctionSet>
    )
  )
}

export default BoxAction
