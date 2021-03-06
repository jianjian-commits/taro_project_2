import { i18next } from 'gm-i18n'
import React, { useRef } from 'react'
import { FunctionSet, Tip, Modal, Button } from '@gmfe/react'
import PropTypes from 'prop-types'
import moment from 'moment'

import BatchEditStatus from './edit_status'
import SubWarehouseAction from './sub_warehouse_action'
import PresetAction from './preset_action'
import { history } from '../../common/service'
import globalStore from '../../stores/global'
import store from './store'
import PospalAction from './pospal_action'

const BoxAction = ({ orders, selectedIds, onOrderUploadToggle }) => {
  const refImportInput = useRef(null)
  const refMutilImportInput = useRef(null)
  const isOldOrderEditable = globalStore.hasPermission('edit_old_order')
  const isStatusEditable = globalStore.hasPermission('edit_order_status')
  const isChildStationOrderStatusEditable = globalStore.hasPermission(
    'edit_child_station_order_status',
  )
  const isBatchOrderEditable = globalStore.hasPermission('add_batchorders')
  const isKingdeeImportable = globalStore.hasPermission('view_kingdee_import')
  const isAddOrder = globalStore.hasPermission('add_order')
  const isGetPospalOrder = globalStore.hasPermission(
    'open_app_pospal_sync_order',
  )
  const isHKOrder = globalStore.isHuaKang()
  const ids = selectedIds

  const handleReloadData = () => {
    store.doFirstRequest()
  }

  const handleUploadFileChoosen = () => {
    const { current } = refImportInput
    if (current.files.length > 0) {
      store.kingdeeSingleImport({ file: current.files[0] }).then((json) => {
        if (json.code === 0) {
          handleReloadData()
          Tip.success(json.msg)
        } else {
          Tip.warning(json.msg)
        }
      })
      current.value = ''
    }
  }

  const handleUploadMutilFileChoosen = () => {
    const { current } = refMutilImportInput
    if (current.files.length > 0) {
      store.kingdeeMutilImport({ file: current.files[0] }).then((json) => {
        if (json.code === 0) {
          handleReloadData()
          Tip.success(json.msg)
        } else {
          Tip.warning(json.msg)
        }
      })
      current.value = ''
    }
  }

  const handleImportSingle = () => {
    refImportInput.current.click()
  }

  const handleImportMulti = () => {
    refMutilImportInput.current.click()
  }

  const handleOrdersStatuChange = (orderStatus, remark) => {
    const {
      selectedOrders: { selected },
    } = store
    const ids = selected.slice()
    return store.orderStatusUpdate(orderStatus, ids, remark)
  }

  const handleChangeSelectedOrders = (
    filter,
    count,
    status,
    to_status,
    remark,
  ) => {
    return store
      .orderStatusPresetUpdate(
        filter.start_date,
        filter.end_date,
        filter.start_date_new,
        filter.end_date_new,
        status,
        filter.orderInput || undefined,
        count,
        to_status,
        remark,
      )
      .then(() => {
        store.doFirstRequest()
        Modal.hide()
      })
  }

  const handleDisplayModal = (orders, modal, ids) => {
    const { filter } = orders
    if (modal === 'batchActionModal' && ids.length === 0) {
      Tip.warning(i18next.t('??????????????????'))
      return
    }
    if (modal === 'batchActionModal') {
      Modal.render({
        children: (
          <BatchEditStatus
            onOrdersStatuChange={handleOrdersStatuChange}
            selectedOrders={store.selectedOrders}
          />
        ),
        title: i18next.t('????????????????????????'),
        onHide: Modal.hide,
      })
    } else if (modal === 'presetActionModal') {
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
        title: i18next.t('??????????????????????????????'),
        onHide: Modal.hide,
      })
    } else if (modal === 'subWarehouseActionModal') {
      Modal.render({
        children: <SubWarehouseAction />,
        title: i18next.t('????????????????????????'),
        onHide: Modal.hide,
      })
    }
  }

  const handleFetchPospalOrder = () => {
    Modal.render({
      title: i18next.t('??????????????????'),
      children: <PospalAction />,
      style: { width: 400 },
      onHide: Modal.hide,
    })
  }

  return (
    <div>
      <input
        accept='.xlsx'
        type='file'
        ref={refImportInput}
        onChange={handleUploadFileChoosen}
        style={{ display: 'none' }}
      />
      <input
        accept='.xlsx,.xls'
        type='file'
        ref={refMutilImportInput}
        onChange={handleUploadMutilFileChoosen}
        style={{ display: 'none' }}
      />
      {isAddOrder && (
        <Button
          type='primary'
          onClick={() => history.push('/order_manage/order/create')}
          className='gm-margin-right-10'
        >
          {i18next.t('????????????')}
        </Button>
      )}
      <FunctionSet
        data={[
          {
            show: isKingdeeImportable && !isHKOrder,
            text: i18next.t('????????????'),
            children: [
              {
                text: i18next.t('????????????(??????)'),
                onClick: handleImportSingle,
              },
              {
                text: i18next.t('????????????(??????)'),
                onClick: handleImportMulti,
              },
            ],
          },
          {
            show: isChildStationOrderStatusEditable || isStatusEditable,
            text: i18next.t('????????????'),
            children: [
              {
                text: i18next.t('??????????????????'),
                onClick: () =>
                  handleDisplayModal(orders, 'batchActionModal', ids),
              },
              {
                text: i18next.t('??????????????????'),
                onClick: () => handleDisplayModal(orders, 'presetActionModal'),
              },
              {
                text: i18next.t('??????????????????'),
                onClick: () =>
                  handleDisplayModal(orders, 'subWarehouseActionModal'),
              },
            ],
          },
          {
            text: i18next.t('????????????'),
            onClick: onOrderUploadToggle,
            show: isBatchOrderEditable && !isHKOrder,
          },
          {
            text: i18next.t('????????????'),
            onClick: () =>
              history.push('/order_manage/order/list/repair_create'),
            show: isOldOrderEditable,
          },
          {
            text: i18next.t('??????????????????'),
            onClick: () => {
              handleFetchPospalOrder()
            },
            show: isGetPospalOrder && !isHKOrder,
          },
        ]}
        right
      />
    </div>
  )
}

BoxAction.propTypes = {
  orders: PropTypes.object,
  selectedIds: PropTypes.array,
  onOrderUploadToggle: PropTypes.func,
}

export default BoxAction
