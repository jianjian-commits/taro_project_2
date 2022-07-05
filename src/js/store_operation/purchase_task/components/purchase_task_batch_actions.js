import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { Tip, Modal, Dialog } from '@gmfe/react'
import { TableUtil } from '@gmfe/table'
import _ from 'lodash'
import PropTypes from 'prop-types'

import BatchModifyModal from './batch_modify_modal'
import { gioTrackEvent, history } from '../../../common/service'
import actions from '../../../actions'
import globalStore from '../../../stores/global'

const BatchActions = ({
  isSupplierUser,
  purchase_task,
  getSearchOption,
  onReleaseTask,
}) => {
  useEffect(() => {
    globalStore.fetchPurchaseSettings()
  }, [])

  const handleBatchModify = (type) => {
    const { taskList, purchaseBatchModify } = purchase_task
    const selectedTasks = _.filter(taskList, (task) => task._gm_select)
    if (!selectedTasks.length) {
      Tip.warning(i18next.t('请至少勾选一条采购任务'))
      return
    }
    Modal.render({
      title: i18next.t('提示'),
      children: (
        <BatchModifyModal
          modifyType={type}
          taskList={selectedTasks}
          selectedAll={purchaseBatchModify.selectAllPage}
          getSearchOption={getSearchOption}
        />
      ),
      onHide: Modal.hide,
      style: {
        width: '500px',
      },
    })
  }

  const handleCreateTaskAll = () => {
    const canAddPurchaseSheet = globalStore.hasPermission('add_purchase_sheet')
    if (!canAddPurchaseSheet) {
      Tip.waning(i18next.t('对不起，您没有生成采购单据的权限'))
      return
    }

    const filterOption = getSearchOption({})

    const releaseOptions = _.pick(
      filterOption,
      'q_type',
      'begin_time',
      'end_time',
      'q',
      'time_config_id',
      'category1_ids',
      'category2_ids',
      'pinlei_ids',
      'status',
      'order_status',
      'settle_supplier_ids',
      'weight_status',
      'purchaser_id',
      'route_id',
      'route_ids',
      'has_created_sheet',
      'source_type',
      'address_label_id',
      'address_ids',
      'is_new_ui',
      'client',
    )

    if (
      filterOption?.purchase_change_release &&
      filterOption.purchase_change_release === 1
    ) {
      releaseOptions.purchase_change_release = 1
    }

    // Dialog.confirm({
    //   children: i18next.t('存在任务已经生成采购单据，是否再次生成？'),
    // }).then(() => {
    actions
      .purchase_task_sheet_create([], releaseOptions)
      .then((sheetNoList) => {
        history.push({
          pathname: '/supply_chain/purchase/bills',
          query: {
            sheet_no: JSON.stringify(sheetNoList),
          },
        })
      })
    // })
  }

  const handleCreateTask = async () => {
    const { settingList } = globalStore
    const { ban_generate_multiple_times } = settingList
    gioTrackEvent('purchase_task_create_task')
    const {
      purchaseBatchModify: { selectAllPage },
      taskList,
    } = purchase_task
    if (selectAllPage) {
      handleCreateTaskAll()
      return
    }
    const canAddPurchaseSheet = globalStore.hasPermission('add_purchase_sheet')
    const release_ids = []

    if (!canAddPurchaseSheet) {
      Tip.waning(i18next.t('对不起，您没有生成采购单据的权限'))
      return
    }

    let isNeedPostRequest = true
    let hasGeneratedPurchaseSheet = false
    if (!_.find(taskList, (task) => task._gm_select)) {
      Tip.warning(i18next.t('请选择采购任务'))
      return
    }

    _.each(taskList, (task) => {
      if (task._gm_select) {
        if (task.release_id) release_ids.push(task.release_id)
        if (task.generated_purchase_sheet) hasGeneratedPurchaseSheet = true
      }
    })

    if (!release_ids.length) {
      Tip.info(i18next.t('未发布任务无法生成采购单据'))
      return
    }

    if (hasGeneratedPurchaseSheet) {
      if (ban_generate_multiple_times === 1) {
        Dialog.confirm({
          children: i18next.t('已经关联了生成采购单，不可重复生成'),
        })
        return
      } else {
        isNeedPostRequest = await Dialog.confirm({
          children: i18next.t('存在已发布任务已生成采购单据，确认再次生成？'),
        })
          .then(() => {
            return true
          })
          .catch(() => {
            return false
          })
      }
    }

    const filterOption = getSearchOption({})

    const options = _.pick(
      filterOption,
      'q_type',
      'begin_time',
      'end_time',
      'time_config_id',
      'weight_status',
      'purchaser_id',
      'route_id',
      'has_created_sheet',
      'is_new_ui',
      'client',
    )

    if (
      filterOption?.purchase_change_release &&
      filterOption.purchase_change_release === 1
    ) {
      options.purchase_change_release = 1
    }
    if (isNeedPostRequest) {
      actions
        .purchase_task_sheet_create(release_ids, options)
        .then((sheetNoList) => {
          history.push({
            pathname: '/supply_chain/purchase/bills',
            query: {
              sheet_no: JSON.stringify(sheetNoList),
            },
          })
        })
    }
  }

  const {
    purchaseBatchModify: { selectAllPage },
    taskListSelected,
  } = purchase_task
  const can_edit_purchase_task_release = globalStore.hasPermission(
    'edit_purchase_task_release',
  )
  const can_edit_out_of_stock_tasks_release = globalStore.hasPermission(
    'edit_out_of_stock_tasks_release',
  )
  const can_add_purchase_sheet = globalStore.hasPermission('add_purchase_sheet')
  const edit_purchase_task_supplier = globalStore.hasPermission(
    'edit_purchase_task_supplier',
  )
  const edit_released_purchase_task = globalStore.hasPermission(
    'edit_released_purchase_task',
  )
  return (
    <TableUtil.BatchActionBar
      onClose={() => actions.purchase_task_list_select_all(false)}
      toggleSelectAll={(bool) => {
        actions.purchase_task_batch_modify_change({
          selectAllPage: Number(bool),
        })
        actions.purchase_task_list_select_all(true)
      }}
      batchActions={[
        {
          name: i18next.t('发布给采购员'),
          show: !isSupplierUser && can_edit_purchase_task_release,
          onClick: onReleaseTask,
          type: 'business',
        },
        {
          name: i18next.t('发布库存不足任务'),
          show: !isSupplierUser && can_edit_out_of_stock_tasks_release,
          type: 'business',
          onClick: () =>
            onReleaseTask({
              release_out_of_stock: 1,
            }),
        },
        {
          name: i18next.t('生成采购单'),
          show: !isSupplierUser && can_add_purchase_sheet,
          onClick: handleCreateTask,
          type: 'business',
        },
        {
          name: i18next.t('批量修改采购员'),
          show: !isSupplierUser && edit_released_purchase_task,
          type: 'edit',
          onClick: () => handleBatchModify('purchaser'),
        },
        {
          name: i18next.t('批量修改供应商'),
          show: !isSupplierUser && edit_purchase_task_supplier,
          onClick: () => handleBatchModify('supplier'),
          type: 'edit',
        },
      ]}
      count={selectAllPage ? null : taskListSelected.length}
      isSelectAll={!!selectAllPage}
    />
  )
}

BatchActions.propTypes = {
  purchase_task: PropTypes.object,
  isSupplierUser: PropTypes.bool,
  getSearchOption: PropTypes.func,
  onReleaseTask: PropTypes.func,
}

export default BatchActions
