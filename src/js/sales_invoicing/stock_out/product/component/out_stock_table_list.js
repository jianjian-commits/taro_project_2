import React from 'react'
import {
  BoxTable,
  Flex,
  Modal,
  Pagination,
  Price,
  RightSideModal,
  Button,
  Popover,
} from '@gmfe/react'
import { Table, TableUtil, selectTableV2HOC } from '@gmfe/table'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'

import store from '../store/list_store'
import globalStore from '../../../../stores/global'

import { outStockStatusMap } from '../util'
import OutStockConfirm from './out_stock_confirm'
import TaskList from '../../../../task/task_list'
import moment from 'moment'
import PopupPrint from '../component/popup_print_modal'
import SVGPrint from 'svg/print.svg'
import SVGDownload from 'svg/download.svg'

const TableRightAction = () => {
  const can_add_out_stock = globalStore.hasPermission('add_out_stock')

  const handleNewReceipt = () => {
    window.open('#/sales_invoicing/stock_out/product/add')
  }

  return (
    <>
      {can_add_out_stock ? (
        <Button type='primary' onClick={handleNewReceipt}>
          {i18next.t('新建出库单')}
        </Button>
      ) : null}
    </>
  )
}

const SelectTable = selectTableV2HOC(Table)

const OutStockTable = observer(() => {
  const {
    outStockList,
    loading,
    pagination,
    searchedType,
    tableSelected,
    isAllPageSelect,
    queryFilter: { status },
  } = store

  const can_edit_out_stock_batch = globalStore.hasPermission(
    'edit_outstock_batch',
  )

  const can_print_stock_out = globalStore.hasPermission('print_out_stock')

  const handlePageChange = (page) => {
    store.fetchOutStockList(page).then(() => {
      store.changePagination(page)
    })
  }

  const handleSelect = (selected) => {
    store.changeSelected(selected)

    // 如果未选择全部，则切换为勾选当前页状态
    if (selected.length < outStockList.length) {
      store.setCurrentPageAllSelect(false)
    }
  }

  const handleSelectTableAll = (isSelect) => {
    store.setTableAllSelect(isSelect)
  }

  const handleSelectAllPage = (isSelectAllPage) => {
    store.setCurrentPageAllSelect(isSelectAllPage)
    // 若选择了全部页，则将全部当前页数据都selected
    if (isSelectAllPage) {
      store.setTableAllSelect(true)
    }
  }

  const handleBatchAndClose = () => {
    Modal.hide()
    handleConfirmBatchOutStock()
  }

  const handleConfirmBatchOutStock = () => {
    store.postBatchOutStock().then(() => {
      RightSideModal.render({
        children: <TaskList tabKey={1} />,
        onHide: RightSideModal.hide,
        opacityMask: true,
        style: {
          width: '300px',
        },
      })
    })
  }

  const handleModalHide = () => {
    Modal.hide()
  }

  const handleBatchOutStockNew = () => {
    const { fetchBatchRemindDataNew } = store
    fetchBatchRemindDataNew().then(({ data }) => {
      const { negative_out_list, out_stock_num } = data
      if (negative_out_list.length) {
        const canOutStock =
          _.uniq(negative_out_list.map((item) => item.out_sheet_id)).length <
            out_stock_num || !!globalStore.otherInfo.isNegativeAllow

        Modal.render({
          title: i18next.t('提醒'),
          style: { width: '500px' },
          onHide: Modal.hide,
          children: (
            <Flex column>
              <OutStockConfirm
                list={negative_out_list}
                onHide={() => Modal.hide()}
                canOutStock={canOutStock}
              />
              <Flex justifyEnd className='gm-margin-top-5'>
                <Button className='gm-margin-right-5' onClick={handleModalHide}>
                  {i18next.t('取消操作')}
                </Button>
                {canOutStock && (
                  <Button type='primary' onClick={handleBatchAndClose}>
                    {i18next.t('继续出库')}
                  </Button>
                )}
              </Flex>
            </Flex>
          ),
        })
      } else {
        handleConfirmBatchOutStock()
      }
    })
  }

  const handlePrint = (isBatch, id) => {
    let data_ids
    if (isBatch) {
      data_ids = isAllPageSelect ? [] : tableSelected.slice()
    } else {
      data_ids = [id]
    }

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: <PopupPrint data_ids={data_ids} />,
    })
  }

  const { isCStation } = globalStore.otherInfo

  return (
    <>
      <BoxTable action={<TableRightAction />}>
        <SelectTable
          data={outStockList.slice()}
          onSelect={handleSelect}
          selected={tableSelected.slice()}
          onSelectAll={handleSelectTableAll}
          batchActionBar={
            tableSelected.length > 0 ? (
              <TableUtil.BatchActionBar
                onClose={() => handleSelectTableAll(false)}
                toggleSelectAll={handleSelectAllPage}
                batchActions={[
                  {
                    name: i18next.t('批量出库'),
                    onClick: handleBatchOutStockNew,
                    // 单据状态不是已出库或者已删除才可以批量出库
                    show:
                      can_edit_out_stock_batch && status !== 2 && status !== 3,
                    type: 'business',
                  },
                  {
                    name: i18next.t('批量打印'),
                    onClick: () => handlePrint(true),
                    show: can_print_stock_out,
                    type: 'business',
                  },
                ]}
                count={isAllPageSelect ? null : tableSelected.length}
                isSelectAll={isAllPageSelect}
              />
            ) : null
          }
          keyField='id'
          loading={loading}
          enableEmptyTip
          columns={[
            {
              Header: i18next.t('出库时间'),
              accessor: 'out_stock_time',
              show: searchedType + '' === '1',
              Cell: (cellProps) => {
                const { out_stock_time } = cellProps.original
                return out_stock_time === '-'
                  ? out_stock_time
                  : moment(out_stock_time).format('YYYY-MM-DD HH:mm')
              },
            },
            {
              Header: i18next.t('建单时间'),
              accessor: 'date_time',
              show: searchedType + '' === '2' || searchedType + '' === '3',
              Cell: (cellProps) => {
                const { date_time } = cellProps.original
                return date_time === '-'
                  ? date_time
                  : moment(date_time).format('YYYY-MM-DD HH:mm')
              },
            },
            {
              Header: i18next.t('收货时间'),
              accessor: 'receive_begin_time',
              show: searchedType + '' === '4',
              Cell: ({ original: { receive_begin_time } }) =>
                receive_begin_time === '-'
                  ? receive_begin_time
                  : moment(receive_begin_time).format('YYYY-MM-DD HH:mm'),
            },
            {
              Header: i18next.t('下单号'),
              accessor: 'id',
              Cell: (cellProps) => {
                const { id } = cellProps.original
                return (
                  <a
                    rel='noopener noreferrer'
                    href={`#/sales_invoicing/stock_out/product/receipt?id=${encodeURIComponent(
                      id,
                    )}`}
                    target='_blank'
                  >
                    {id}
                  </a>
                )
              },
            },
            {
              Header: isCStation ? i18next.t('客户名') : i18next.t('商户信息'),
              accessor: 'out_stock_target',
            },
            {
              Header: i18next.t('成本金额'),
              accessor: 'money',
              Cell: ({ original: { money } }) => {
                return money === '-' ? money : money + Price.getUnit()
              },
            },
            {
              Header: i18next.t('单据状态'),
              accessor: 'status',
              Cell: ({ original: { status } }) => {
                return outStockStatusMap[status]
              },
            },
            {
              Header: i18next.t('单据备注'),
              accessor: 'out_stock_remark',
              Cell: ({ original: { out_stock_remark } }) => {
                return out_stock_remark || '-'
              },
            },
            {
              width: 90,
              Header: TableUtil.OperationHeader,
              accessor: 'operation',
              Cell: (cellProps) => {
                return (
                  <TableUtil.OperationCell>
                    <Flex justifyAround>
                      {globalStore.hasPermission('print_out_stock') && (
                        <Popover type='hover' popup={i18next.t('打印')}>
                          <span
                            className='gm-cursor gm-text-14 gm-text-hover-primary'
                            onClick={() =>
                              handlePrint(false, cellProps.original.id)
                            }
                          >
                            <SVGPrint />
                          </span>
                        </Popover>
                      )}
                      {/* 先进先出才提供导出 */}
                      {globalStore.user.stock_method === 2 && (
                        <Popover type='hover' popup={i18next.t('导出')}>
                          <span
                            className='gm-cursor gm-text-14 gm-text-hover-primary'
                            onClick={() =>
                              window.open(
                                `/stock/out_stock_sheet/fj_export?id=${cellProps.original.id}`,
                              )
                            }
                          >
                            <SVGDownload />
                          </span>
                        </Popover>
                      )}
                    </Flex>
                  </TableUtil.OperationCell>
                )
              },
            },
          ]}
        />
      </BoxTable>
      <Flex
        justifyEnd
        className='text-center gm-margin-top-20 gm-margin-right-15'
      >
        <Pagination
          toPage={handlePageChange}
          data={pagination}
          nextDisabled={outStockList && outStockList.length < pagination.limit}
        />
      </Flex>
    </>
  )
})

export default OutStockTable
