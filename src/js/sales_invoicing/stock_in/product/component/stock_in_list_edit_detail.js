import React, { useCallback, useRef, useState } from 'react'
import { BoxPanel, Modal, ToolTip } from '@gmfe/react'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import globalStore from '../../../../stores/global'
import {
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableXVirtualized,
  diyTableXHOC,
  TableXUtil,
  selectTableXHOC,
} from '@gmfe/table-x'

import { t } from 'gm-i18n'
import store from '../store/receipt_store'
import { observer } from 'mobx-react'
import BatchPopover from './batch_popover'
import TableRight from './list_detail_table_right'
import ProductNameCell from './product_name_cell'
import StdQuantityCell from './std_quantity_cell'
import StdTareQuantityCell from './std_tare_quantity_cell'
import StdPriceCell from './std_price_cell'
import PurchaseQuantityCell from './purchase_quantity_cell'
import PurchasePriceCell from './purchase_price_cell'
import MoneyCell from './money_cell'
import ProductionTimeCell from './production_time_cell'
import ShelfLifeCell from './shelf_life_cell'
import LifeTimeCell from './life_time_cell'
import ShelfNameCell from './shelf_name_cell'
import ArrivalCell from './arrival_cell'
import ProductRemarkCell from './product_remark_cell'
import RefCostCell from './ref_cost_cell'
import OperationHeaderCell from './operation_header_cell'
import TextAreaCell from './text_area_cell'
import DifferentPriceCell from './different_price_cell'
import RefCostSelect from './ref_cost_header_select_cell'
import StdQuantityHeaderCell from './std_quantity_header_cell'
import BatchSetShelfModal from './batch_set_shelf_modal'
import TaxRateCell from './tax_rate_cell'
import TaxMoneyCell from './tax_money_cell'
import InStockMoneyNoTaxCell from './in_stock_money_no_tax_cell'
import Summary from './summary'

const KeyboardVirtualTable = selectTableXHOC(
  diyTableXHOC(
    keyboardTableXHOC(fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized))),
  ),
)

const { OperationHeader, TABLE_X, SortHeader } = TableXUtil

const EditDetail = observer(() => {
  const {
    stockInReceiptList,
    tableSelected,
    sortItem: { sort_by, sort_direction },
  } = store

  const tableRef = useRef()

  const { stock_method } = globalStore.user

  const can_get_shelf = globalStore.hasPermission('get_shelf')

  const handleDetailAdd = useCallback(() => {
    store.addStockInReceiptListItem()
  }, [])

  const handleSort = useCallback((name, direction) => {
    store.sortStockInReceiptList(name, direction)
  }, [])

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, stockInReceiptList.length) * TABLE_X.HEIGHT_TR

  const [highlightIndex, setHighlightIndex] = useState()

  // ??????????????????????????????????????????????????????????????????????????????
  const columns = React.useMemo(() => {
    return [
      {
        Header: t('?????????'),
        diyEnable: false,
        accessor: 'num',
        diyGroupName: t('????????????'),
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return <BatchPopover index={index} />
        },
      },
      {
        Header: OperationHeader,
        accessor: 'action',
        diyEnable: false,
        diyGroupName: t('????????????'),
        diyItemText: t('??????'),
        fixed: 'left',
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          return (
            <OperationHeaderCell
              index={cellProps.row.index}
              onAddRow={handleDetailAdd}
            />
          )
        },
      },
      {
        Header: t('??????ID'),
        accessor: 'spu_id',
        diyGroupName: t('????????????'),
        minWidth: 100,
        show: false,
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='spu_id' />
        },
      },
      {
        Header: t('??????ID'),
        accessor: 'id',
        minWidth: 100,
        diyGroupName: t('????????????'),
        show: false,
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='id' />
        },
      },
      {
        Header: (
          <span>
            {t('????????????')}
            <SortHeader
              onChange={(direction) => handleSort('name', direction)}
              type={sort_by === 'name' ? sort_direction : null}
            />
          </span>
        ),
        accessor: 'name',
        diyItemText: t('????????????'),
        diyGroupName: t('????????????'),
        diyEnable: false,
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ProductNameCell index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <span>
            {t('????????????')}
            <SortHeader
              onChange={(direction) => handleSort('category', direction)}
              type={sort_by === 'category' ? sort_direction : null}
            />
          </span>
        ),
        minWidth: 100,
        diyGroupName: t('????????????'),
        diyItemText: t('????????????'),
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='category' />
        },
      },
      {
        Header: t('??????'),
        show: false,
        diyEnable: true,
        isKeyboard: true,
        diyGroupName: t('????????????'),
        accessor: 'tare_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return <StdTareQuantityCell index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <div>
            <span>{t('???????????????????????????')}</span>
            <ToolTip
              popup={
                <div className='gm-padding-5'>
                  {t('??????????????????????????? = ????????? - ??????')}
                </div>
              }
            />
          </div>
        ),
        diyEnable: false,
        isKeyboard: true,
        diyGroupName: t('????????????'),
        accessor: 'quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return <StdQuantityCell index={cellProps.row.index} />
        },
      },
      {
        Header: <RefCostSelect />,
        diyItemText: '????????????',
        accessor: 'ref_price',
        minWidth: 90,
        diyGroupName: t('????????????'),
        show: false,
        Cell: (cellProps) => {
          return <RefCostCell index={cellProps.row.index} />
        },
      },
      {
        Header: <StdQuantityHeaderCell />,
        minWidth: 150,
        accessor: 'unit_price',
        diyGroupName: t('????????????'),
        diyItemText: t('??????????????????????????????'),
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <StdPriceCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('??????'),
        accessor: 'different_price',
        minWidth: 80,
        diyGroupName: t('????????????'),
        Cell: (cellProps) => {
          return <DifferentPriceCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('???????????????????????????'),
        accessor: 'purchase_unit_quantity',
        show: false,
        isKeyboard: true,
        diyGroupName: t('????????????'),
        minWidth: 140,
        Cell: (cellProps) => {
          return <PurchaseQuantityCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('??????????????????????????????'),
        accessor: 'purchase_unit_price',
        diyGroupName: t('????????????'),
        show: false,
        minWidth: 150,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <PurchasePriceCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('????????????'),
        accessor: 'money',
        diyEnable: false,
        diyGroupName: t('????????????'),
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          return <MoneyCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('???????????????????????????'),
        id: 'instock_money_no_tax',
        diyGroupName: t('????????????'),
        minWidth: 160,
        Cell: (cellProps) => (
          <InStockMoneyNoTaxCell index={cellProps.row.index} />
        ),
      },
      {
        Header: t('????????????'),
        id: 'tax_rate',
        diyGroupName: t('????????????'),
        minWidth: 100,
        Cell: (cellProps) => <TaxRateCell index={cellProps.row.index} />,
      },
      {
        Header: t('????????????'),
        id: 'tax_money',
        diyGroupName: t('????????????'),
        minWidth: 120,
        Cell: (cellProps) => <TaxMoneyCell index={cellProps.row.index} />,
      },
      stock_method === 2 && {
        Header: t('????????????'),
        accessor: 'production_time',
        diyGroupName: t('????????????'),
        diyEnable: stock_method === 2,
        show: stock_method === 2,
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return <ProductionTimeCell index={cellProps.row.index} />
        },
      },
      stock_method === 2 && {
        Header: t('?????????'),
        id: 'shelf_life',
        diyGroupName: t('????????????'),
        diyEnable: stock_method === 2,
        show: stock_method === 2,
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return <ShelfLifeCell index={cellProps.row.index} />
        },
      },
      stock_method === 2 && {
        Header: t('?????????'),
        accessor: 'life_time',
        diyGroupName: t('????????????'),
        diyEnable: stock_method === 2,
        show: stock_method === 2,
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return <LifeTimeCell index={cellProps.row.index} />
        },
      },
      can_get_shelf && {
        Header: t('????????????'),
        accessor: 'shelf_name',
        minWidth: 200,
        diyGroupName: t('????????????'),
        diyEnable: can_get_shelf,
        show: can_get_shelf,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ShelfNameCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('?????????'),
        accessor: 'operator',
        minWidth: 90,
        diyGroupName: t('????????????'),
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='operator' />
        },
      },
      {
        show: true,
        Header: t('????????????'),
        minWidth: 80,
        diyGroupName: t('????????????'),
        headerStyle: {
          textAlign: 'center',
        },
        accessor: 'is_arrival',
        Cell: (cellProps) => {
          return <ArrivalCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('????????????'),
        show: false,
        accessor: 'remark',
        diyGroupName: t('????????????'),
        minWidth: 150,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ProductRemarkCell index={cellProps.row.index} />
        },
      },
    ].filter((item) => item) // ??????diy,show ???????????????????????????????????????????????????false
  }, [
    handleDetailAdd,
    can_get_shelf,
    stock_method,
    handleSort,
    sort_by,
    sort_direction,
  ]) // ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????bug
  const handleModalHide = () => {
    Modal.hide()
  }

  const handleBatchSetShelf = () => {
    Modal.render({
      children: <BatchSetShelfModal onCancel={handleModalHide} />,
      title: `${t('??????')}`,
      onHide: Modal.hide,
      size: 'sm',
    })
  }

  const handleTableSelect = useCallback((selected) => {
    store.changeTableSelect(selected)
  }, [])

  const handleTableSelectAll = useCallback((isSelectAll) => {
    store.changeTableSelectAll(isSelectAll)
  }, [])

  const handleHighlight = useCallback((index) => {
    setHighlightIndex(index)
  }, [])
  return (
    <BoxPanel
      icon='bill'
      title={t('????????????')}
      summary={
        <Summary handleHighlight={handleHighlight} tableRef={tableRef} />
      }
      collapse
      right={<TableRight />}
    >
      <KeyboardVirtualTable
        onAddRow={handleDetailAdd}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        id='in_stock_table_edit'
        isTrHighlight={(_, index) => index === highlightIndex}
        diyGroupSorting={[t('????????????')]}
        data={stockInReceiptList.slice()}
        isTrDisable={(item) => {
          return item.spu_status === 0
        }}
        columns={columns}
        keyField='uniqueKeyForSelect'
        fixedSelect
        selected={tableSelected.slice()}
        onSelect={handleTableSelect}
        refVirtualized={tableRef}
        batchActionBar={
          tableSelected.length ? (
            <TableXUtil.BatchActionBar
              pure
              onClose={() => handleTableSelectAll(false)}
              count={tableSelected.length}
              batchActions={[
                {
                  name: t('????????????????????????'),
                  onClick: handleBatchSetShelf,
                  show: can_get_shelf,
                  type: 'edit',
                },
              ]}
            />
          ) : null
        }
      />
    </BoxPanel>
  )
})

export default EditDetail
