import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../list_store'
import { TableUtil } from '@gmfe/table'
import globalStore from 'stores/global'
import { history } from 'common/service'
import { Dialog, Modal, RightSideModal, Tip, Select } from '@gmfe/react'
import FormulaSetting from '../../component/formula_setting'
import TaskList from '../../../../task/task_list'
import EditStock from '../../component/edit_stock'
import EditDispatchMethod from '../../component/edit_dispatch_method'
import _ from 'lodash'
import SmartPriceModal from '../../component/smart_price_modal'
import { Request } from '@gm-common/request'
import PropType from 'prop-types'
import { getQueryFilterForList } from '../../util'
import { System } from '../../../../common/service'

const Picking = observer(() => (
  <>
    <span>{i18next.t('采购类型')}：</span>
    <Select
      // eslint-disable-next-line
      onChange={store.setPickType}
      name='picking_type'
      data={[
        { value: 1, text: i18next.t('临采') },
        { value: 2, text: i18next.t('非临采') },
      ]}
      value={store.pickType}
    />
    <div style={{ color: '#ff0000' }}>
      <p>{i18next.t('提示')}：</p>
      <p>1. {i18next.t('将选中的商品批量修改采购类型')}</p>
      <p>2. {i18next.t('修改采购类型后将会影响拣货任务')}</p>
    </div>
  </>
))

const BatchActionBar = observer((props) => {
  const { isSelectAllPage, pagination, selectedList } = store

  const p_edit_batch_sku_formula = globalStore.hasPermission(
    'edit_batch_sku_formula',
  )
  const p_edit_product_sku_batch = globalStore.hasPermission(
    'edit_product_sku_batch',
  )

  const p_delete_sku_batch = globalStore.hasPermission('delete_sku_batch')
  const p_delete_spu_batch = globalStore.hasPermission('delete_spu_batch')
  const p_editSmartPrice = globalStore.hasPermission('edit_smart_pricing')
  const p_editSku = globalStore.hasPermission('edit_sku')
  // 通用
  const p_addSpu = globalStore.hasPermission('add_spu')
  // 本站
  const p_addSpuPrivate = globalStore.hasPermission('add_spu_private')

  // 批量设置采购类型
  const handleSetPickType = () => {
    Dialog.confirm({
      onOK: handleUpdatePick,
      title: i18next.t('批量修改采购类型'),
      children: <Picking />,
    }).catch(() => store.setSelected([], []))
  }
  const handleUpdatePick = () => {
    // 选中的spuid selectedList
    const { filter, pickType, isSelectAllPage, setSelected } = store
    let query
    if (isSelectAllPage) {
      query = getQueryFilterForList(filter)
    } else {
      query = {
        spu_ids: JSON.stringify(
          selectedList.slice().filter((id) => id[0] === 'C'),
        ),
      }
    }
    query.update_dict = JSON.stringify({
      picking_type: pickType,
    })
    Request('/merchandise/spu/bulk_update')
      .data(query)
      .post()
      .then(() => {
        Tip.success(i18next.t('修改采购类型成功'))
      })
      .finally(() => setSelected([], []))
  }

  const checkSelectSpu = () => {
    // 如果是全选所有页，交给后台校验
    const { selectedTree, isSelectAllPage } = store
    let isSelect = false
    if (isSelectAllPage) {
      isSelect = true
    } else if (_.keys(selectedTree).length) {
      isSelect = true
    }
    if (!isSelect) {
      Tip.warning(i18next.t('无可用商品，请至少选择一个商品进行操作'))
    }

    return isSelect
  }

  const checkSelectSku = () => {
    // 如果是全选所有页，交给后台校验
    const { isSelectAllPage, selectedTree } = store
    let isSelect = false
    if (isSelectAllPage) {
      isSelect = true
    } else {
      if (_.find(selectedTree, (v) => !!v.length)) isSelect = true
    }
    if (!isSelect) {
      Tip.warning(i18next.t('无可用商品规格，请至少选择一个商品规格进行操作'))
    }

    return isSelect
  }

  const handleBatchSpuUpdate = () => {
    if (!checkSelectSpu()) {
      return
    }
    history.push(System.getUrl('/merchandise/manage/list/batch_update'))
  }

  const handleSaveFormula = (info) => {
    store.batchSaveFormulaSetting(info).then((json) => {
      if (json.code === 0) {
        Tip.success(i18next.t('设置定价公式成功'))
        store.doFirstRequest()
        Modal.hide()
      }
    })
  }

  const handleEditFormula = () => {
    if (!checkSelectSku()) {
      return
    }

    Modal.render({
      children: (
        // eslint-disable-next-line
        <FormulaSetting onSave={handleSaveFormula} onCancel={Modal.hide} />
      ),
      title: i18next.t('设置定价公式'),
      style: { width: '500px' },
      onHide: Modal.hide,
    })
  }

  const handleSpuBatchDelete = () => {
    if (!checkSelectSpu()) {
      return
    }

    const {
      selectedList,
      isSelectAllPage,
      pagination: { count },
    } = store
    const spuSelectedNum = isSelectAllPage ? count : selectedList.length

    Dialog.confirm({
      children: (
        <div>
          <span>
            {i18next.t('已选择')} {spuSelectedNum}{' '}
            {i18next.t('个商品，确定要删除所选商品吗')}
          </span>
          <br />
          <span className='gm-text-red'>
            {i18next.t(
              '1.删除所选商品且删除所选商品下的所有销售规格和采购规格',
            )}
          </span>
          <br />
          <span className='gm-text-red'>
            {i18next.t('2.删除后商品相关数据将无法恢复，请谨慎操作')}
          </span>
          <br />
          <span className='gm-text-red'>
            {i18next.t(
              '3.商品库为总分仓共享，删除商品会影响其他总分仓站点的商品库',
            )}
          </span>
        </div>
      ),
      title: i18next.t('批量删除商品'),
      onOK: () => {
        store.batchDeleteSpu().then((json) => {
          if (json.data.async === 1) {
            RightSideModal.render({
              children: <TaskList tabKey={1} />,
              onHide: RightSideModal.hide,
              style: {
                width: '300px',
              },
            })
          }
        })
      },
    })
  }

  const handleSkuBatchDelete = () => {
    if (!checkSelectSku()) {
      return
    }

    Dialog.confirm({
      children: i18next.t('确定要删除所选规格吗?'),
      title: i18next.t('批量删除商品规格'),
      onOK: () => {
        store.batchDeleteSku().then(() => {
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

  const jumpToSmartPricePage = (info) => {
    store.editSmartPriceNext(info).then((json) => {
      if (json.code === 0) {
        // type 为 sale or list， 否则为异步任务id
        history.push(
          System.getUrl('/merchandise/manage/list/smart_price?type=list'),
        )
      }
    })
  }

  const handleEditSmartPriceNext = (info) => {
    if (isSelectAllPage) {
      const data = getQueryFilterForList(store.filter)
      Request('/station/skus/count')
        .data(data)
        .post()
        .then((json) => {
          if (json.data > 10000) {
            store.smartPriceFilter = store.collectSmartPriceListParams(info)
            updatePrice()
          } else jumpToSmartPricePage(info)
        })
    } else {
      jumpToSmartPricePage(info)
    }
    Modal.hide()
  }

  const handleSmartPrice = () => {
    if (!checkSelectSku()) {
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
        store.batchUpdateSku({ state: 1 }).then(() => {
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
        store.batchUpdateSku({ state: 0 }).then(() => {
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
            store.batchUpdateSku(params).then(() => {
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

  const handleDispatchMethod = () => {
    Modal.render({
      children: (
        <EditDispatchMethod
          onSave={({ type }) => {
            store
              .batchUpdateDispatchMedthod({ dispatch_method: type })
              .then(() => {
                Tip.success(i18next.t('修改成功'))
                store.doCurrentRequest()
                Modal.hide()
              })
          }}
          onCancel={Modal.hide}
        />
      ),
      title: i18next.t('批量修改投框方式'),
      style: { width: '500px' },
      onHide: Modal.hide,
    })
  }

  const handleAsyncImage = () => {
    Dialog.confirm({
      title: i18next.t('同步商品图片'),
      children: i18next.t(
        '同步后，商品图片将覆盖此商品所有销售规格图片，是否确认?',
      ),
      onOK: () => {
        store.batchAsyncSpuImage().then((json) => {
          if (json.data.async === 1) {
            RightSideModal.render({
              children: <TaskList tabKey={1} />,
              onHide: RightSideModal.hide,
              style: {
                width: '300px',
              },
            })
          }
        })
      },
    })
  }

  return (
    <>
      <TableUtil.BatchActionBar
        onClose={() => props.onSelectAll(false)}
        toggleSelectAll={(bool) => {
          props.onSelectAll(true)
          store.toggleIsSelectAllPage(bool)
        }}
        batchActions={[
          {
            name: i18next.t('修改商品'),
            onClick: handleBatchSpuUpdate,
            type: 'edit',
            show: p_edit_product_sku_batch,
          },
          {
            name: i18next.t('设置公式'),
            onClick: handleEditFormula,
            type: 'edit',
            show: p_edit_batch_sku_formula,
          },
          {
            name: i18next.t('智能定价'),
            onClick: handleSmartPrice,
            type: 'business',
            show: p_editSmartPrice,
          },
          {
            name: i18next.t('删除商品'),
            onClick: handleSpuBatchDelete,
            type: 'delete',
            show: p_delete_spu_batch,
          },
          {
            name: i18next.t('删除商品规格'),
            type: 'delete',
            onClick: handleSkuBatchDelete,
            show: p_delete_sku_batch,
          },
          {
            name: i18next.t('修改采购类型'),
            onClick: handleSetPickType,
            type: 'edit',
            show: !props.retail,
          },
          {
            name: i18next.t('上架'), // !todo 权限
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
            onClick: handleBatchStock,
            show: p_editSku,
            type: 'edit',
          },
          {
            name: i18next.t('设置投框方式'),
            onClick: handleDispatchMethod,
            type: 'edit',
            show:
              (p_addSpu || p_addSpuPrivate) && !!store.selectedSpuList.length,
          },
          {
            name: i18next.t('批量同步商品图片'),
            onClick: handleAsyncImage,
          },
        ]}
        count={isSelectAllPage ? pagination.count : selectedList.length}
        isSelectAll={isSelectAllPage}
      />
    </>
  )
})

BatchActionBar.propTypes = {
  retail: PropType.bool,
}

export default BatchActionBar
