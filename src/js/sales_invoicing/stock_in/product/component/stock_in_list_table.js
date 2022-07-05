import React, { useState, useRef, useEffect } from 'react'
import {
  Flex,
  Price,
  BoxTable,
  RightSideModal,
  Button,
  Popover,
} from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import globalStore from '../../../../stores/global'
import { t } from 'gm-i18n'
import { TableX, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import SVGPrint from '../../../../../svg/print.svg'
import SVGDownload from '../../../../../svg/download.svg'
import BatchImportDialog from '../../../../product/components/batch_import_dialog' // todo 批量导入先不做处理
import PropTypes from 'prop-types'
import store from '../store/list_store'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import { PRODUCT_STATUS } from '../../../../common/enum'
import _ from 'lodash'
import PopupPrintModal from './popup_print_modal'
import moment from 'moment'
import SupplierDel from '../../../../common/components/supplier_del_sign'

const SelectTable = selectTableXHOC(TableX)

const ListRight = observer((props) => {
  const can_import_in_stock = globalStore.hasPermission('import_in_stock')
  const can_add_in_stock = globalStore.hasPermission('add_in_stock')

  const handleCreate = () => {
    window.open('#/sales_invoicing/stock_in/product/create')
  }

  return (
    <div>
      {can_add_in_stock ? (
        <Button type='primary' onClick={handleCreate}>
          {t('新建入库单')}
        </Button>
      ) : null}
      <div className='gm-gap-10' />
      {can_import_in_stock ? (
        <Button type='primary' plain onClick={props.onDialogToggle}>
          {t('批量导入')}
        </Button>
      ) : null}
    </div>
  )
})

ListRight.propTypes = {
  onDialogToggle: PropTypes.func.isRequired,
}

const ReceiptPrint = ({ index, onPrintFunc, onExportFunc }) => {
  const { list } = store

  return (
    <Flex justifyAround>
      <Popover type='hover' popup={t('打印')}>
        <span
          className='b-table-td-print gm-text-hover-primary gm-cursor gm-text-16'
          onClick={() => onPrintFunc(list[index].id)}
        >
          <SVGPrint />
        </span>
      </Popover>
      {/* 先进先出才提供导出 */}
      {globalStore.user.stock_method === 2 && (
        <Popover type='hover' popup={t('导出')}>
          <span
            className='b-table-td-print gm-text-hover-primary gm-cursor gm-text-16'
            onClick={onExportFunc}
          >
            <SVGDownload />
          </span>
        </Popover>
      )}
    </Flex>
  )
}

ReceiptPrint.propTypes = {
  index: PropTypes.number.isRequired,
  onPrintFunc: PropTypes.func.isRequired,
  onExportFunc: PropTypes.func.isRequired,
}

const StockInListTable = observer(() => {
  const [dialogShow, setDialogShow] = useState(false)
  const stockInPaginationRef = useRef(null)

  useEffect(() => {
    store.setRequestPaginationFunc(
      stockInPaginationRef.current.apiDoFirstRequest,
    )

    store.apiDoFirstRequest()
  }, [])

  const { loading, list, isAllPageSelect, tableSelected } = store

  const canPrint = globalStore.hasPermission('print_in_stock')

  const handleDialogToggle = () => {
    setDialogShow((preState) => !preState)
  }

  const handlePageChange = (page) => {
    return store.fetchStockInList(page)
  }

  const handleSelectAllPage = (isSelectAllPage) => {
    store.setCurrentAllSelect(isSelectAllPage)
    // 若选择了全部页，则将全部当前页数据都selected
    if (isSelectAllPage) {
      store.setTableAllSelect(true)
    }
  }

  const handleSelectTableAll = (isSelect) => {
    store.setTableAllSelect(isSelect)
  }

  const handleSelect = (selected) => {
    store.changeSelected(selected)
    // 如果未选择全部项，则切换为勾选当前页状态
    if (selected.length < list.length) {
      store.setCurrentAllSelect(false)
    }
  }

  const handlePopupPrintModal = (id) => {
    const data_ids = id
      ? [id] // 单个打印
      : null // 批量打印

    const modalProps = {}

    // 不是单个打印，判断是否全选所有页
    if (!data_ids) {
      if (store.isAllPageSelect) {
        modalProps.search_data = _.omit(store.getSearchData())
      } else {
        modalProps.data_ids = store.tableSelected.slice()
      }
    } else {
      modalProps.data_ids = data_ids
    }

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <PopupPrintModal closeModal={RightSideModal.hide} {...modalProps} />
      ),
    })
  }

  // 判断是否从pc客户端进入的
  const is_electron = window.navigator.userAgent.includes('Electron') && true

  return (
    <>
      <ManagePagination
        id='stock_in_list_managePagination'
        ref={stockInPaginationRef}
        onRequest={handlePageChange}
      >
        <BoxTable action={<ListRight onDialogToggle={handleDialogToggle} />}>
          <SelectTable
            loading={loading}
            keyField='id'
            selected={tableSelected.slice()}
            onSelect={handleSelect}
            batchActionBar={
              tableSelected.length > 0 ? (
                <TableXUtil.BatchActionBar
                  onClose={() => handleSelectTableAll(false)}
                  toggleSelectAll={handleSelectAllPage}
                  batchActions={[
                    {
                      name: t('批量打印'),
                      onClick: () => handlePopupPrintModal(),
                      type: 'business',
                    },
                  ]}
                  count={isAllPageSelect ? null : tableSelected.length}
                  isSelectAll={isAllPageSelect}
                />
              ) : null
            }
            className='b-distribute-order-table'
            data={list.slice()}
            columns={[
              {
                Header: t('入库时间'),
                accessor: 'submit_time',
                minWidth: 150,
                show: store.filter.type + '' === '1',
                Cell: (cellProps) => {
                  const { submit_time } = cellProps.row.original
                  return submit_time === '-'
                    ? submit_time
                    : moment(submit_time).format('YYYY-MM-DD HH:mm')
                },
              },
              {
                Header: t('建单时间'),
                accessor: 'date_time',
                minWidth: 150,
                show: store.filter.type + '' !== '1',
                Cell: (cellProps) => {
                  return moment(cellProps.row.original.date_time).format(
                    'YYYY-MM-DD HH:mm',
                  )
                },
              },
              {
                Header: t('入库单号'),
                accessor: 'id',
                minWidth: 250,
                Cell: (cellProps) => {
                  const { status, id } = cellProps.row.original
                  const model =
                    status === 1 || status === 0 ? 'create' : 'detail'

                  return (
                    <Link
                      to={`/sales_invoicing/stock_in/product/${model}?id=${id}`}
                      target={is_electron ? '' : '_blank'}
                    >
                      {id}
                    </Link>
                  )
                },
              },
              {
                Header: t('供应商信息'),
                accessor: 'supplier_name',
                minWidth: 150,
                Cell: (cellProps) => {
                  const {
                    supplier_status,
                    supplier_name,
                    supplier_customer_id,
                  } = cellProps.row.original
                  return (
                    <Flex>
                      {/* supplier_status:0 为已删除，空为没有供应商 */}
                      {supplier_status === 0 && <SupplierDel />}
                      {`${supplier_name}(${supplier_customer_id})`}
                    </Flex>
                  )
                },
              },
              {
                Header: t('入库金额'),
                accessor: 'total_money',
                minWidth: 80,
                Cell: (cellProps) => {
                  return cellProps.row.original.total_money + Price.getUnit()
                },
              },
              {
                Header: t('单据状态'),
                accessor: 'status',
                minWidth: 80,
                Cell: (cellProps) => {
                  return PRODUCT_STATUS[cellProps.row.original.status]
                },
              },
              {
                Header: t('建单人'),
                accessor: 'creator',
                minWidth: 80,
              },
              {
                Header: t('打印状态'),
                accessor: 'print_times',
                minWidth: 80,
                Cell: (cellProps) => {
                  return cellProps.row.original.print_times
                    ? `${t('已打印')}(${cellProps.row.original.print_times})`
                    : t('未打印')
                },
              },
              {
                Header: <Flex justifyCenter>{t('操作')}</Flex>,
                accessor: 'receipt_print',
                show: canPrint,
                minWidth: 80,
                Cell: (cellProps) => {
                  return (
                    <ReceiptPrint
                      index={cellProps.row.index}
                      onPrintFunc={handlePopupPrintModal}
                      onExportFunc={() =>
                        window.open(
                          `/stock/in_stock_sheet/fj_export?id=${cellProps.row.original.id}`,
                        )
                      }
                    />
                  )
                },
              },
            ]}
          />
        </BoxTable>
      </ManagePagination>
      <BatchImportDialog
        show={dialogShow}
        title={t('批量导入入库单')}
        type='stockin'
        onHide={handleDialogToggle}
      />
    </>
  )
})

export default StockInListTable
