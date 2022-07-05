import React, { Component } from 'react'
import store from '../store'
import { observer } from 'mobx-react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { BoxTable, Button, Modal, RightSideModal, Tip } from '@gmfe/react'
import moment from 'moment'
import PrintModal from '../../components/print_modal'
import BatchStockInModal from './batch_stock_in_modal'
import RecordLossModal from './record_loss_modal'
import { getEnumValue } from 'common/filter'
import { PROCESS_RECEIPT_STATUS } from '../../utils'
import { openNewTab } from 'common/util'

const { BatchActionBar } = TableXUtil

const SelectTableX = selectTableXHOC(TableX)

@observer
class List extends Component {
  paginationRef = React.createRef()
  columns = [
    {
      Header: t('下达日期'),
      accessor: 'release_time',
      Cell: ({ row: { original } }) =>
        moment(original.release_time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      Header: t('计划编号'),
      accessor: 'custom_id',
      Cell: ({ row: { original } }) => (
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={`#/supply_chain/process/receipt/plan_detail?id=${original.id}`}
        >
          {original.custom_id}
        </a>
      ),
    },
    {
      Header: t('生成成品'),
      accessor: 'sku_name',
      Cell: ({ row: { original } }) =>
        `${original.sku_name}(${original.sku_id})`,
    },
    {
      Header: (
        <>
          {t('计划生产数')}（{t('销售单位')}）
        </>
      ),
      accessor: 'plan_amount',
      Cell: ({ row: { original } }) =>
        `${original.plan_amount}${original.sale_unit_name}`,
    },
    {
      Header: (
        <>
          {t('已完成数')}（{t('销售单位')}）
        </>
      ),
      accessor: 'finish_amount',
      Cell: ({ row: { original } }) =>
        `${original.finish_amount || 0}${original.sale_unit_name}`,
    },
    {
      Header: t('开工日期'),
      accessor: 'start_time',
      Cell: ({ row: { original } }) =>
        original.start_time
          ? moment(original.start_time).format('YYYY-MM-DD')
          : '-',
    },
    {
      Header: t('计划完成日期'),
      accessor: 'plan_finish_time',
      Cell: ({ row: { original } }) =>
        original.plan_finish_time
          ? moment(original.plan_finish_time).format('YYYY-MM-DD')
          : '-',
    },
    {
      Header: t('状态'),
      accessor: 'status',
      Cell: ({ row: { original } }) =>
        getEnumValue(PROCESS_RECEIPT_STATUS, original.status),
    },
  ]

  componentDidMount() {
    store.setDoFirstRequest(this.paginationRef.current.apiDoFirstRequest)
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleChangePage = (pagination) => {
    const { fetchList } = store
    return fetchList(pagination)
  }

  handleSelect = (selected) => {
    const { setSelected } = store
    setSelected(selected)
  }

  handlePrintMaterial = () => {
    const { selected, isSelectAllPage } = store

    // 全选所有页需要获取所有的ids
    if (isSelectAllPage) {
      store.fetchListAllIds().then((json) => {
        openNewTab(
          `#/supply_chain/process/receipt/print/material_print?ids=${JSON.stringify(
            json.data,
          )}`,
        )
      })
    } else {
      openNewTab(
        `#/supply_chain/process/receipt/print/material_print?ids=${JSON.stringify(
          selected,
        )}`,
      )
    }
  }

  handlePrintProcess = async () => {
    const { selected, isSelectAllPage } = store

    let ids = selected
    if (isSelectAllPage) {
      try {
        const json = await store.fetchListAllIds()
        ids = json.data
      } catch (err) {
        Tip.warning(err)
      }
    }

    RightSideModal.render({
      children: <PrintModal ids={ids} printType='byReceipt' />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: false,
      style: {
        width: '300px',
      },
    })
  }

  handleBatchStockIn = () => {
    store.getCheckProductList().then((res) => {
      const { sheet_no, create_time } = res?.data || {}
      if (sheet_no && create_time) {
        Modal.render({
          style: { width: '400px' },
          title: t('提示'),
          children: (
            <BatchStockInModal
              sheetNo={sheet_no}
              createTime={moment(create_time).format('YYYY-MM-DD HH:mm:ss')}
              onOk={this.handleStockIn}
              onHide={() => Modal.hide()}
            />
          ),
          onHide: () => Modal.hide(),
        })
      } else {
        this.handleStockIn({ merge: 0 })
      }
    })
  }

  // 批量生成待入库单
  handleStockIn = (params) => {
    // 判断今日有无成品待入库单
    return store.setBatchStockIn(params).then((json) => {
      if (json.data?.success_list?.ids?.length > 0) {
        Tip.success(t('已开工状态的加工单批量创建成品入库单成功'))
      } else {
        Tip.warning(t('无已开工状态的加工单据可操作'))
      }
    })
  }

  handleRecordLoss = () => {
    Modal.render({
      title: t('批量录入损耗'),
      children: <RecordLossModal />,
      onHide: Modal.hide,
      style: { width: '600px' },
    })
  }

  render() {
    const { list, selected, loading, isSelectAllPage } = store
    return (
      <BoxTable
        action={
          <Button type='primary' onClick={this.handleRecordLoss}>
            {t('录入损耗')}
          </Button>
        }
      >
        <ManagePaginationV2
          onRequest={this.handleChangePage}
          id='list'
          ref={this.paginationRef}
        >
          <SelectTableX
            loading={loading}
            selected={selected.slice()}
            onSelect={this.handleSelect}
            keyField='id'
            data={list.slice()}
            columns={this.columns}
            batchActionBar={
              selected.length ? (
                <BatchActionBar
                  isSelectAll={isSelectAllPage}
                  count={isSelectAllPage ? null : selected.length}
                  toggleSelectAll={(bool) => store.setSelectAll(bool)}
                  onClose={() => this.handleSelect([])}
                  batchActions={[
                    {
                      name: t('打印物料单'),
                      onClick: this.handlePrintMaterial,
                      type: 'business',
                    },
                    {
                      name: t('打印加工单'),
                      onClick: this.handlePrintProcess,
                      type: 'business',
                    },
                    {
                      name: t('生成待入库单'),
                      onClick: this.handleBatchStockIn,
                      type: 'business',
                    },
                  ]}
                />
              ) : null
            }
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default List
