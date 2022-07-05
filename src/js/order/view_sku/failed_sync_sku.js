import { t } from 'gm-i18n'
import React, { useEffect } from 'react'
import {
  BoxTable,
  Price,
  Modal,
  Tip,
  RightSideModal,
  Dialog,
  Button,
} from '@gmfe/react'
import { Table, selectTableV2HOC } from '@gmfe/table'
import { observer } from 'mobx-react'
import qs from 'query-string'
import _ from 'lodash'
import Big from 'big.js'

import TableTotalText from 'common/components/table_total_text'
import SyncPriceModal from '../components/sync_price_modal'
import TaskList from '../../task/task_list'
import ModifyPriceModal from './modify_price'

import store from './store'
import globalStore from 'stores/global'

const SelectTable = selectTableV2HOC(Table)

const FailedSyncSkus = observer((props) => {
  const { location } = props
  const { query } = location
  const { task_id, type } = query
  // type 为异步任务类型  17 -- 商品价格同步至报价单  3 -- 同步最新单价  18 -- 手动修改商品单价
  const failType = _.toNumber(type)
  const { failedSkuList, slectedFailedSkuList } = store

  useEffect(() => {
    // 失败商品列表
    store.getFailedSkusList(task_id, failType)
  }, [])

  const getSelectedSkus = () => {
    const data = []
    _.each(failedSkuList, (item) => {
      if (
        _.findIndex(
          slectedFailedSkuList,
          (sku) => sku === item._skuId || sku === item._skuId,
        ) !== -1
      ) {
        data.push({
          sku_id: item.id || item.sku_id,
          order_id: item.order_id,
          detail_id: item.detail_id,
        })
      }
    })
    return data
  }

  const handleSyncToSaleMenu = () => {
    const data = getSelectedSkus()
    const requestData = { sku_data: JSON.stringify(data) }
    store.batchSyncToSalemenu(requestData).then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  const handleSyncToSaleMenuPre = () => {
    if (slectedFailedSkuList.length === 0) {
      return Tip.info(t('请至少选择一个商品'))
    }

    // 二次确认
    Dialog.confirm({
      title: t('同步至报价单'),
      children: (
        <div className='gm-padding-5'>
          {t('是否将所选商品价格同步至报价单？')}
        </div>
      ),
    }).then(() => {
      handleSyncToSaleMenu()
    })
  }

  const handlePriceSyncToSalemenu = (value) => {
    const data = getSelectedSkus()
    if (!data.length) {
      Modal.hide()
      return null
    }

    store.batchSyncLatestPrice(data, value).then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  const handlePriceSync = () => {
    // 二次确认
    if (slectedFailedSkuList.length === 0) {
      return Tip.info(t('请至少选择一个商品'))
    }

    Modal.render({
      children: (
        <SyncPriceModal
          onCancel={() => Modal.hide()}
          onOk={handlePriceSyncToSalemenu}
        />
      ),
      title: t('同步最新单价'),
      onHide: Modal.hide,
    })
  }

  const handleModifyPriceCancel = () => {
    RightSideModal.hide()
    store.skuBatchClear()
  }

  const handleModifyPriceSave = () => {
    return store.updateSkuPrice().then(() => {
      // 异步任务
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  const handleBatchAction = () => {
    if (!slectedFailedSkuList.length) {
      return Tip.info(t('请至少选择一个商品'))
    } else {
      store.selectedSkuSort(1)
    }

    RightSideModal.render({
      children: (
        <ModifyPriceModal
          showRefPrice={false}
          onOk={handleModifyPriceSave}
          onCancel={handleModifyPriceCancel}
        />
      ),
      onHide: RightSideModal.hide,
      title: t('批量修改单价'),
      style: {
        width: '850px',
      },
    })
  }

  const renderAction = () => {
    // 订单同步报价单
    const syncToSaleMenu = globalStore.hasPermission(
      'edit_order_price_sync_to_sku',
    )
    // 同步最新单价
    const isPriceSyncable = globalStore.hasPermission('get_sku_price_auto')
    // 手动修改单价
    const isPriceEditable = globalStore.hasPermission('get_sku_price_manual') // 手动修改单价

    if (failType === 3) {
      return isPriceSyncable ? (
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handlePriceSync}
        >
          {t('同步最新单价')}
        </Button>
      ) : null
    } else if (failType === 17) {
      return syncToSaleMenu ? (
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handleSyncToSaleMenuPre}
        >
          {t('同步至报价单')}
        </Button>
      ) : null
    } else {
      return isPriceEditable ? (
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handleBatchAction}
        >
          {t('修改单价')}
        </Button>
      ) : null
    }
  }

  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: t('商品总数'),
                content: failedSkuList.length,
              },
            ]}
          />
        </BoxTable.Info>
      }
      action={renderAction()}
    >
      <SelectTable
        data={failedSkuList.slice()}
        keyField='_skuId'
        selected={slectedFailedSkuList}
        onSelect={(selected) => store.selectFailedSkus(selected)}
        onSelectAll={(all) => store.selectAllFailedSkus(all)}
        isSelectorDisable={(row) => row.reason_type === 1}
        columns={[
          {
            Header: t('商品名'),
            accessor: failType !== 3 ? 'name' : 'sku_name',
          },
          {
            Header: t('报价单'),
            accessor: 'salemenu_name',
          },
          {
            Header: t('单价(基本单位)'),
            id: 'std_sale_price_forsale',
            accessor: (d) => {
              let div = 100
              if (failType !== 3) {
                div = 1
              }
              return (
                Big(d.std_sale_price_forsale).div(div).toFixed(2) +
                Price.getUnit(d.fee_type) +
                '/' +
                d.std_unit_name_forsale
              )
            },
          },
          {
            Header: t('订单号'),
            id: 'order_id',
            accessor: (d) => {
              // 订单被删除，不可查看订单
              if (d.reason_type === 1 && failType === 18) {
                return <span>{d.order_id}</span>
              }

              return (
                <a
                  href={`#/order_manage/order/list/detail?${qs.stringify({
                    id: d.order_id,
                  })}`}
                  style={{ textDecoration: 'underline' }}
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  {d.order_id}
                </a>
              )
            },
          },
          {
            Header: t('商户名'),
            accessor: failType !== 3 ? 'resname' : 'address_name',
          },
          {
            Header: t('失败原因'),
            id: 'reason',
            accessor: (d) => <span className='gm-text-red'>{d.reason}</span>,
          },
        ]}
      />
    </BoxTable>
  )
})

export default FailedSyncSkus
