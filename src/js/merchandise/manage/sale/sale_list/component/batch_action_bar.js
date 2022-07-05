import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { getQueryFilter } from '../util'
import { TableUtil } from '@gmfe/table'
import globalStore from 'stores/global'
import { Dialog, Modal, RightSideModal, Tip } from '@gmfe/react'
import FormulaSetting from '../../../component/formula_setting'
import TaskList from '../../../../../task/task_list'
import SmartPriceModal from '../../../component/smart_price_modal'
import BatchBoxTypeModal from './batch_modify_box_type_modal'
import EditStock from '../../../component/edit_stock'
import { history, System } from 'common/service'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const BatchActionBar = observer((props) => {
  const { isSelectAllPage, selectedList, pagination } = store

  const p_edit_batch_sku_formula = globalStore.hasPermission(
    'edit_batch_sku_formula',
  )
  const p_delete_sku_batch = globalStore.hasPermission('delete_sku_batch')
  const p_editSmartPrice = globalStore.hasPermission('edit_smart_pricing')
  const p_editSku = globalStore.hasPermission('edit_sku')
  const p_editBoxType = globalStore.hasPermission('edit_box_type')

  const updatePrice = () => {
    const data = { ...store.smartPriceFilter }
    if (System.isC()) data.is_retail_interface = 1
    Request('/product/sku/smart_pricing/update')
      .data(data)
      .post()
      .then((json) => {
        if (json.code === 0) {
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        }
      })
  }

  const jumpToSmartPricePage = (id, info) => {
    store.editSmartPriceNext(id, info).then((json) => {
      if (json.code === 0) {
        // type 为 sale or list， 否则为异步任务id
        history.push(`/merchandise/manage/sale/smart_price?type=sale`)
      }
    })
  }

  const handleEditSmartPriceNext = (info) => {
    const { id } = props.query
    if (isSelectAllPage) {
      const data = getQueryFilter(store.filter, id)
      Request('/station/skus/count')
        .data(data)
        .post()
        .then((json) => {
          if (json.data > 10000) {
            store.smartPriceFilter = store.collectSmartPriceListParams(id, info)
            updatePrice()
          } else jumpToSmartPricePage(id, info)
        })
    } else {
      jumpToSmartPricePage(id, info)
    }
    Modal.hide()
  }

  const handleSmartPrice = () => {
    if (!checkSelectSku() || !checkSelectSkuCleanFood()) {
      return
    }

    Modal.render({
      title: i18next.t('智能定价'),
      children: (
        <SmartPriceModal
          onCancel={() => Modal.hide()}
          onNext={handleEditSmartPriceNext}
        />
      ),
      onHide: Modal.hide,
    })
  }

  const checkSelectSkuCleanFood = () => {
    // 如果是全选所有页，交给后台校验
    const { selectAll, selectAllType, selectedList, list } = store

    if (!(selectAll && selectAllType === 2)) {
      let isAllCleanFood = true
      _.each(list, (sku) => {
        _.each(selectedList, (selected) => {
          if (selected === sku.sku_id && !sku.clean_food) {
            isAllCleanFood = false
          }
        })
      })

      if (isAllCleanFood) {
        Tip.warning(
          i18next.t(
            '开启加工商品暂不支持定价设置，请至少选择一个未开启加工商品规格进行定价设置',
          ),
        )

        return false
      }
    }

    return true
  }

  const checkSelectSku = () => {
    // 如果是全选所有页，交给后台校验
    const { selectAll, selectAllType, selectedList } = store
    let isSelect = false
    if (selectAll && selectAllType === 2) {
      isSelect = true
    } else {
      if (selectedList.length) isSelect = true
    }
    if (!isSelect) {
      Tip.warning(
        i18next.t('无可用商品规格，请至少选择一个商品规格进行定价设置'),
      )
    }

    return isSelect
  }

  const handleEditFormula = () => {
    if (!checkSelectSku() || !checkSelectSkuCleanFood()) {
      return
    }

    Modal.render({
      children: (
        <FormulaSetting onSave={handleSaveFormula} onCancel={Modal.hide} />
      ),
      title: i18next.t('设置定价公式'),
      style: { width: '500px' },
      onHide: Modal.hide,
    })
  }

  const handleSaveFormula = (info) => {
    const { id } = props.query
    store.batchSaveFormulaSetting(id, info).then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('设置定价公式成功'))
        store.doFirstRequest()
        Modal.hide()
      }
    })
  }

  const handleBatchDelete = () => {
    if (!checkSelectSku()) {
      return
    }

    Dialog.confirm({
      children: i18next.t('确定要删除所选规格吗?'),
      title: i18next.t('批量删除商品规格'),
      onOK: () => {
        store.batchDeleteSku(props.query.id).then(() => {
          RightSideModal.render({
            children: <TaskList tabKey={1} />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        })
      },
    })
  }

  const handleBatchUp = () => {
    if (!checkSelectSku()) {
      return
    }
    const {
      isSelectAllPage,
      selectedList: { length },
    } = store
    Dialog.confirm({
      children: i18next.t('batch_up_sku', {
        num: isSelectAllPage ? pagination.count : length,
      }),
      title: i18next.t('批量修改上架'),
      onOK: () => {
        store.batchUpdateSku(props.query.id, { state: 1 }).then(() => {
          Tip.success(i18next.t('修改成功'))
          store.doFirstRequest()
          Modal.hide()
        })
      },
    })
  }

  const handleBatchDown = () => {
    if (!checkSelectSku()) {
      return
    }
    const {
      isSelectAllPage,
      selectedList: { length },
    } = store
    Dialog.confirm({
      children: i18next.t('batch_down_sku', {
        num: isSelectAllPage ? pagination.count : length,
      }),
      title: i18next.t('批量修改下架'),
      onOK: () => {
        store.batchUpdateSku(props.query.id, { state: 0 }).then(() => {
          Tip.success(i18next.t('修改成功'))
          store.doFirstRequest()
          Modal.hide()
        })
      },
    })
  }

  const handleBatchStock = () => {
    if (!checkSelectSku()) {
      return
    }
    Modal.render({
      children: (
        <EditStock
          onSave={({ type, stock }) => {
            const params = {
              stock_type: type,
              stocks: type === 2 ? stock : -99999,
            }
            store.batchUpdateSku(props.query.id, params).then(() => {
              Tip.success(i18next.t('修改成功'))
              store.doFirstRequest()
              Modal.hide()
            })
          }}
          onCancel={Modal.hide}
        />
      ),
      title: i18next.t('批量修改库存'),
      style: { width: '500px' },
      onHide: Modal.hide,
    })
  }

  const handleBatchChangeBoxType = (box_type) => {
    store.batchUpdateSku(props.query.id, { box_type: box_type }).then(() => {
      Tip.success(i18next.t('修改成功'))
      store.doFirstRequest()
      Modal.hide()
    })
  }

  const showBatchBoxTypeModal = () => {
    Modal.render({
      title: i18next.t('批量修改装箱类型'),
      children: (
        <BatchBoxTypeModal
          onCancel={() => Modal.hide()}
          onSubmit={handleBatchChangeBoxType}
        />
      ),
      onHide: Modal.hide,
    })
  }

  return (
    <>
      <TableUtil.BatchActionBar
        onClose={() => store.toggleSelectAllSku(false)}
        toggleSelectAll={(bool) => {
          store.toggleSelectAllSku(true)
          store.toggleIsSelectAllPage(bool)
        }}
        batchActions={[
          {
            name: i18next.t('设置公式'),
            onClick: handleEditFormula,
            type: 'edit',
            show: p_edit_batch_sku_formula,
          },
          {
            name: i18next.t('智能定价'),
            onClick: handleSmartPrice,
            type: 'edit',
            show: p_editSmartPrice,
          },
          {
            name: i18next.t('删除商品规格'),
            onClick: handleBatchDelete,
            show: p_delete_sku_batch,
            type: 'delete',
          },
          {
            name: i18next.t('上架'),
            onClick: handleBatchUp,
            type: 'business',
          },
          {
            name: i18next.t('下架'),
            onClick: handleBatchDown,
            type: 'business',
          },
          {
            name: i18next.t('设置库存'),
            type: 'edit',
            onClick: handleBatchStock,
            show: p_editSku,
          },
          {
            name: i18next.t('修改装箱类型'),
            onClick: showBatchBoxTypeModal,
            show: p_editBoxType,
          },
        ]}
        count={isSelectAllPage ? pagination.count : selectedList.length}
        isSelectAll={isSelectAllPage}
      />
    </>
  )
})

export default BatchActionBar
