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

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns = React.useMemo(() => {
    return [
      {
        Header: t('批次号'),
        diyEnable: false,
        accessor: 'num',
        diyGroupName: t('基础字段'),
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
        diyGroupName: t('基础字段'),
        diyItemText: t('操作'),
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
        Header: t('商品ID'),
        accessor: 'spu_id',
        diyGroupName: t('基础字段'),
        minWidth: 100,
        show: false,
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='spu_id' />
        },
      },
      {
        Header: t('规格ID'),
        accessor: 'id',
        minWidth: 100,
        diyGroupName: t('基础字段'),
        show: false,
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='id' />
        },
      },
      {
        Header: (
          <span>
            {t('商品名称')}
            <SortHeader
              onChange={(direction) => handleSort('name', direction)}
              type={sort_by === 'name' ? sort_direction : null}
            />
          </span>
        ),
        accessor: 'name',
        diyItemText: t('商品名称'),
        diyGroupName: t('基础字段'),
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
            {t('商品分类')}
            <SortHeader
              onChange={(direction) => handleSort('category', direction)}
              type={sort_by === 'category' ? sort_direction : null}
            />
          </span>
        ),
        minWidth: 100,
        diyGroupName: t('基础字段'),
        diyItemText: t('商品分类'),
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='category' />
        },
      },
      {
        Header: t('皮重'),
        show: false,
        diyEnable: true,
        isKeyboard: true,
        diyGroupName: t('基础字段'),
        accessor: 'tare_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return <StdTareQuantityCell index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <div>
            <span>{t('入库数（基本单位）')}</span>
            <ToolTip
              popup={
                <div className='gm-padding-5'>
                  {t('入库数（基本单位） = 读磅数 - 皮重')}
                </div>
              }
            />
          </div>
        ),
        diyEnable: false,
        isKeyboard: true,
        diyGroupName: t('基础字段'),
        accessor: 'quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          return <StdQuantityCell index={cellProps.row.index} />
        },
      },
      {
        Header: <RefCostSelect />,
        diyItemText: '参考成本',
        accessor: 'ref_price',
        minWidth: 90,
        diyGroupName: t('基础字段'),
        show: false,
        Cell: (cellProps) => {
          return <RefCostCell index={cellProps.row.index} />
        },
      },
      {
        Header: <StdQuantityHeaderCell />,
        minWidth: 150,
        accessor: 'unit_price',
        diyGroupName: t('基础字段'),
        diyItemText: t('入库单价（基本单位）'),
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <StdPriceCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('补差'),
        accessor: 'different_price',
        minWidth: 80,
        diyGroupName: t('基础字段'),
        Cell: (cellProps) => {
          return <DifferentPriceCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('入库数（包装单位）'),
        accessor: 'purchase_unit_quantity',
        show: false,
        isKeyboard: true,
        diyGroupName: t('基础字段'),
        minWidth: 140,
        Cell: (cellProps) => {
          return <PurchaseQuantityCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('入库单价（包装单位）'),
        accessor: 'purchase_unit_price',
        diyGroupName: t('基础字段'),
        show: false,
        minWidth: 150,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <PurchasePriceCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('入库金额'),
        accessor: 'money',
        diyEnable: false,
        diyGroupName: t('基础字段'),
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          return <MoneyCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('入库金额（不含税）'),
        id: 'instock_money_no_tax',
        diyGroupName: t('基础字段'),
        minWidth: 160,
        Cell: (cellProps) => (
          <InStockMoneyNoTaxCell index={cellProps.row.index} />
        ),
      },
      {
        Header: t('进项税率'),
        id: 'tax_rate',
        diyGroupName: t('基础字段'),
        minWidth: 100,
        Cell: (cellProps) => <TaxRateCell index={cellProps.row.index} />,
      },
      {
        Header: t('进项税额'),
        id: 'tax_money',
        diyGroupName: t('基础字段'),
        minWidth: 120,
        Cell: (cellProps) => <TaxMoneyCell index={cellProps.row.index} />,
      },
      stock_method === 2 && {
        Header: t('生产日期'),
        accessor: 'production_time',
        diyGroupName: t('基础字段'),
        diyEnable: stock_method === 2,
        show: stock_method === 2,
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return <ProductionTimeCell index={cellProps.row.index} />
        },
      },
      stock_method === 2 && {
        Header: t('保质期'),
        id: 'shelf_life',
        diyGroupName: t('基础字段'),
        diyEnable: stock_method === 2,
        show: stock_method === 2,
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return <ShelfLifeCell index={cellProps.row.index} />
        },
      },
      stock_method === 2 && {
        Header: t('到期日'),
        accessor: 'life_time',
        diyGroupName: t('基础字段'),
        diyEnable: stock_method === 2,
        show: stock_method === 2,
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return <LifeTimeCell index={cellProps.row.index} />
        },
      },
      can_get_shelf && {
        Header: t('存放货位'),
        accessor: 'shelf_name',
        minWidth: 200,
        diyGroupName: t('基础字段'),
        diyEnable: can_get_shelf,
        show: can_get_shelf,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ShelfNameCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('操作人'),
        accessor: 'operator',
        minWidth: 90,
        diyGroupName: t('基础字段'),
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='operator' />
        },
      },
      {
        show: true,
        Header: t('到货状态'),
        minWidth: 80,
        diyGroupName: t('基础字段'),
        headerStyle: {
          textAlign: 'center',
        },
        accessor: 'is_arrival',
        Cell: (cellProps) => {
          return <ArrivalCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('商品备注'),
        show: false,
        accessor: 'remark',
        diyGroupName: t('基础字段'),
        minWidth: 150,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ProductRemarkCell index={cellProps.row.index} />
        },
      },
    ].filter((item) => item) // 由于diy,show 不可控，因此需要特殊处理，这里去除false
  }, [
    handleDetailAdd,
    can_get_shelf,
    stock_method,
    handleSort,
    sort_by,
    sort_direction,
  ]) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug
  const handleModalHide = () => {
    Modal.hide()
  }

  const handleBatchSetShelf = () => {
    Modal.render({
      children: <BatchSetShelfModal onCancel={handleModalHide} />,
      title: `${t('提示')}`,
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
      title={t('商品明细')}
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
        diyGroupSorting={[t('基础字段')]}
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
                  name: t('批量修改存放货位'),
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
