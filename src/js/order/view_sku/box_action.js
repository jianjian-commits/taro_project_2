import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { history } from '../../common/service'
import {
  FunctionSet,
  Tip,
  Dialog,
  Modal,
  RightSideModal,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import SellOutDialog from '../../common/components/sell_out_dialog'
import SyncPriceModal from '../components/sync_price_modal'
import TaskList from '../../task/task_list'
import ModifyPriceModal from './modify_price'
import { isLK } from '../util'

import globalStore from '../../stores/global'
import store from './store'

const updateSkuPriceApi = (data) =>
  Request('/station/order/update_sku_price_auto_new').data(data).post()

const BoxAction = observer((props) => {
  const { refPriceType } = props
  const isAddOrder = globalStore.hasPermission('add_order')
  const isPriceEditable = globalStore.hasPermission('get_sku_price_manual') // 手工修改单价
  const isSyncPrice = globalStore.hasPermission('get_sku_price_auto') // 同步最新单价
  const isOldOrderEditable = globalStore.hasPermission('edit_old_order_change')
  const syncToSaleMenu = globalStore.hasPermission(
    'edit_order_price_sync_to_sku',
  ) // 同步至报价单
  const isBatchDeleteSku = globalStore.hasPermission('batch_delete_skus') // 批量删除商品
  const isBatchReplaceSku = globalStore.hasPermission('batch_change_skus') // 批量修改商品
  const isEditOrderPurchase = globalStore.hasPermission(
    'edit_batch_create_order_purchase',
  ) // 批量进入采购
  const purchaseTaskMode = globalStore.otherInfo.orderCreatePurchaseTask
  const { skus } = store
  const { isAllSelected } = skus.filter

  useEffect(() => {
    return () => {
      handleResetSelectAll()
    }
  }, [])

  const handleResetSelectAll = () => {
    store.filterChange({
      isAllSelected: false,
    })
  }

  const handleBatchActionSellOut = (skus) => {
    const skuList = skus.list.slice()
    let list = []
    let filterList = []

    const disable = isDisabledSkus(skuList)
    if (!disable) {
      return Tip.info(i18next.t('请至少选择一个商品'))
    } else {
      // 优惠券退券逻辑
      Dialog.confirm({
        children: <SellOutDialog />,
        title: i18next.t('批量修改缺货'),
        size: 'md',
      }).then(() => {
        if (isOldOrderEditable) {
          list = _.filter(skuList, (v) => v._selected)
        } else {
          list = _.filter(skuList, (v) => v.status <= 5 && v._selected)
        }
        filterList = _.map(list, (v) => ({
          order_id: v.order_id,
          sku_id: v.id,
          detail_id: v.detail_id,
        }))
        Request('/station/order/batch_out_of_stock/update')
          .data({ sku_info: JSON.stringify(filterList) })
          .post()
          .then(() => {
            Tip.success(
              i18next.t('KEY116', {
                VAR1: filterList.length,
              }) /* src:`成功修改${filterList.length}条商品为缺货` => tpl:成功修改${VAR1}条商品为缺货 */,
            )
            handleResetSelectAll()
            store.doFirstRequest()
          })
          .catch(() => {
            return false
          })
      })
    }
  }

  const renderTaskList = () => {
    Modal.hide()
    RightSideModal.render({
      children: <TaskList tabKey={1} />,
      onHide: RightSideModal.hide,
      style: {
        width: '300px',
      },
    })
  }

  const handlePriceSyncChange = (value) => {
    const { skuBatch } = store
    const selectSkuList = []
    if (isAllSelected) {
      return updateSkuPriceApi({
        ...store.searchData,
        price_unit_type: value,
      }).then(() => {
        renderTaskList()
      })
    }
    _.forEach(skuBatch.list.slice(), (sku) => {
      _.forEach(sku.orders, (order) => {
        selectSkuList.push({
          sku_id: sku.sku_id,
          order_id: order.order_id,
          detail_id: order.detail_id,
        })
      })
    })
    if (!selectSkuList.length) {
      Tip.info(i18next.t('请至少选择一个商品'))
      Modal.hide()
      return null
    }

    return updateSkuPriceApi({
      update_list: JSON.stringify(selectSkuList),
      price_unit_type: value,
    }).then(() => {
      renderTaskList()
    })
  }

  const handlePriceSync = (skus) => {
    const list = skus.list.slice()
    if (!isAllSelected) {
      const disable = isDisabledSkus(list)
      if (!disable) {
        return Tip.info(i18next.t('请至少选择一个商品'))
      }
      store.selectedSkuSort(0)
    }
    Modal.render({
      children: (
        <SyncPriceModal
          onCancel={() => Modal.hide()}
          onOk={(value) => handlePriceSyncChange(value)}
        />
      ),
      title: i18next.t('同步最新单价'),
      onHide: Modal.hide,
    })
  }

  const handleModifyPriceSave = () => {
    // 这里有两个RightSideModal，保证上一个关闭了
    RightSideModal.hide()
    return store.updateSkuPrice().then(() => {
      // 异步任务
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })

      store.filterChange({
        isAllSelected: false,
      })
      store.doFirstRequest()
    })
  }

  const handleModifyPriceCancel = () => {
    RightSideModal.hide()
    store.skuBatchClear()
  }

  const isDisabledSkus = (list) => {
    // 若有edit_old_order_change权限，则不管订单什么状态，都可以修改
    const isHasSelect = _.find(list, (sku) => sku._selected)
    const disable =
      isHasSelect &&
      (isOldOrderEditable || _.find(list, (sku) => sku.status <= 5))

    return disable
  }

  // 手动修改单价
  const handleBatchAction = (skus) => {
    const list = skus.list.slice()
    if (isAllSelected) {
      store.getSkuBatchList(store.searchData, 1)
    } else {
      const disable = isDisabledSkus(list)
      if (!disable) {
        return Tip.info(i18next.t('请至少选择一个商品'))
      }
      store.selectedSkuSort(0)
    }

    RightSideModal.render({
      children: (
        <ModifyPriceModal
          refPriceType={refPriceType}
          showRefPrice
          onOk={handleModifyPriceSave}
          onCancel={handleModifyPriceCancel}
        />
      ),
      onHide: RightSideModal.hide,
      title: i18next.t('批量修改单价'),
      style: {
        width: '850px',
      },
    })
  }

  const handleSyncToSalemenu = () => {
    let requestData = {}

    // 同步报价单 -- 1、选择部分商品，传[{sku_id, order_id}] 2、选择全部，传所有搜索条件 searchData
    if (!isAllSelected) {
      const selectedSkus = _.filter(skus.list.slice(), (item) => item._selected)
      const selected = _.map(selectedSkus, (item) => {
        return {
          sku_id: item.id,
          order_id: item.order_id,
          detail_id: item.detail_id,
        }
      })
      requestData = { sku_data: JSON.stringify(selected) }
    } else {
      requestData = store.searchData
    }

    store.batchSyncToSalemenu(requestData).then(() => {
      // 异步处理展开右侧列表
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  const handleSyncToSalemenuPre = () => {
    const list = skus.list.slice()

    if (!isAllSelected) {
      const disable = isDisabledSkus(list)
      if (!disable) {
        return Tip.info(i18next.t('请至少选择一个商品'))
      }
    }

    Dialog.confirm({
      title: i18next.t('同步至报价单'),
      children: (
        <div className='gm-padding-5'>
          <div>{i18next.t('是否将所选商品价格同步至报价单？')}</div>
          <div style={{ color: '#AAAAAA' }}>
            {i18next.t('阶梯定价商品的价格不能同步至报价单')}
          </div>
        </div>
      ),
    }).then(() => {
      handleSyncToSalemenu()
    })
  }

  // 确认删除商品
  const handleDeleteConfirm = (isAll, params) => {
    if (isAll === true) {
      store
        .batchDeleteSkuApi({
          ...store.searchData,
        })
        .then(() => {
          renderTaskList()
        })
    } else {
      store
        .batchDeleteSkuApi({
          delete_details: JSON.stringify(params),
        })
        .then(() => {
          renderTaskList()
        })
    }
  }

  // 批量删除商品
  const handleDeleteAction = (skus) => {
    const list = skus.list.slice()
    const isHasSelect = _.find(list, (sku) => sku._selected)
    if (!isHasSelect) {
      return Tip.info(i18next.t('请至少选择一个商品'))
    }

    const selected = _.filter(
      list,
      ({ order_id, _selected }) => !isLK(order_id) && _selected,
    )

    // 由于多sku中，sku带有detail_id,无需处理，直接传数据
    const selectedList = _.map(selected, (item) => ({
      sku_id: item.id,
      order_id: item.order_id,
      detail_id: item.detail_id,
    }))

    Dialog.dialog({
      title: i18next.t('批量删除商品'),
      children: (
        <div>
          {i18next.t('已选中')}
          <strong className='gm-text-red'>
            {isAllSelected ? skus.pagination.count : selected.length}
          </strong>
          {i18next.t('个商品')}
          {!isAllSelected && i18next.t('（不包含流转单）')}
          {i18next.t('，确定要删除吗')}
          {isAllSelected && i18next.t('（流转单商品不会被删除）')}
        </div>
      ),
      onOK: () => {
        handleDeleteConfirm(isAllSelected, selectedList)
      },
      disableMaskClose: true,
    })
  }

  // 批量替换商品
  const handleReplaceAction = () => {
    const list = skus.list.slice()
    if (isAllSelected) {
      store.getSkuBatchList(store.searchData)
    } else {
      const isHasSelect = _.find(list, (sku) => sku._selected)
      if (!isHasSelect) {
        return Tip.info(i18next.t('请至少选择一个商品'))
      }
      store.selectedSkuSort(0)
    }
    return history.push(`/order_manage/order/list/replace_sku`)
  }

  // 确认进入采购
  const handlePurchaseConfirm = (isAll, params) => {
    if (isAll === true) {
      return store
        .createPurchaseByOrder({
          ...store.searchData,
        })
        .then(() => {
          renderTaskList()
        })
    } else {
      return store
        .createPurchaseByOrder({
          tasks: JSON.stringify(params),
        })
        .then(() => {
          renderTaskList()
        })
    }
  }

  // 批量进入采购
  const handleBatchPurchase = (skus) => {
    const list = skus.list.slice()
    const isHasSelect = _.find(list, (sku) => sku._selected)
    if (!isHasSelect) {
      return Tip.info(i18next.t('请至少选择一个商品'))
    }
    // 选择自动采购模式
    if (purchaseTaskMode === 0) {
      return Tip.warning(
        i18next.t(
          '正在使用自动生成采购任务的策略，不支持手动，请到系统设置中更改设置',
        ),
      )
    }
    const selected = _.filter(list, (sku) => sku._selected)
    const selectedList = _.map(selected, (sku) => {
      return {
        sku_id: sku.id,
        plan_purchase_amount: sku.quantity,
        order_id: sku.order_id,
        detail_id: sku.detail_id,
      }
    })
    Dialog.dialog({
      title: i18next.t('批量进入采购'),
      children: (
        <div>
          {i18next.t('已选中')}
          <strong className='gm-text-red'>
            {isAllSelected ? skus.pagination.count : selected.length}
          </strong>
          {i18next.t('个商品，确定要进入采购吗？')}
        </div>
      ),
      onOK: () => {
        handlePurchaseConfirm(isAllSelected, selectedList)
      },
      disableMaskClose: true,
    }).catch(() => {
      store.skuBatchClear()
    })
  }

  return (
    <div>
      {isAddOrder && (
        <Button
          type='primary'
          onClick={() => history.push('/order_manage/order/create')}
          className='gm-margin-right-10'
        >
          {i18next.t('新建订单')}
        </Button>
      )}
      <FunctionSet
        data={[
          {
            text: i18next.t('批量修改缺货'),
            onClick: () => handleBatchActionSellOut(skus),
          },
          {
            text: i18next.t('批量修改单价'),
            children: [
              {
                text: i18next.t('手动修改单价'),
                onClick: () => handleBatchAction(skus),
                show: isPriceEditable,
              },
              {
                text: i18next.t('同步最新单价'),
                onClick: () => handlePriceSync(skus),
                show: isSyncPrice,
              },
            ],
            show: isPriceEditable || isSyncPrice,
          },
          {
            text: i18next.t('同步至报价单'),
            onClick: () => handleSyncToSalemenuPre(),
            show: syncToSaleMenu,
          },
          {
            text: i18next.t('批量替换商品'),
            onClick: () => handleReplaceAction(),
            show: isBatchReplaceSku,
          },
          {
            text: i18next.t('批量进入采购'),
            onClick: () => handleBatchPurchase(skus),
            show: isEditOrderPurchase,
          },
          {
            text: i18next.t('批量删除商品'),
            onClick: () => handleDeleteAction(skus),
            show: isBatchDeleteSku,
          },
        ]}
        right
      />
    </div>
  )
})

BoxAction.propTypes = {
  skus: PropTypes.object,
  skuBatch: PropTypes.object,
  refPriceType: PropTypes.number,
}

export default BoxAction
