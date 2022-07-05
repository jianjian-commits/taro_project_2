import React, { useMemo, useCallback } from 'react'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import { ToolTip } from '@gmfe/react'
import {
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableXVirtualized,
  TableXUtil,
} from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { addStore as store } from '../../store'
import { productSearchFilter } from '../../utils'
import OperationHeaderCell from './operation_header_cell'
import StateEditCell from './state_edit_cell'
import StockEditCell from './stock_edit_cell'
import ProductEditCell from './product_edit_cell'

const { OperationHeader, TABLE_X } = TableXUtil

const KeyboardVirtualTable = keyboardTableXHOC(
  fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized)),
)

const StepOneTable = observer(({ refList, searchIndex }) => {
  const handleDetailAdd = useCallback((index) => {
    store.addTableOneCell(index)
  }, [])

  const handleDetailDel = useCallback((index) => {
    store.delTableOneCell(index)

    if (store.tableOne.length === 0) {
      // 添加一行新的空行
      handleDetailAdd(0)
    }
  }, [])

  const handleChangeState = useCallback((value, index) => {
    store.setTableOneCellData(index, { status: value })
  }, [])

  const handleChangeStock = useCallback((value, index) => {
    store.setTableOneCellData(index, { stock_num: value })
  }, [])

  const handleSelectProduct = useCallback((value, index) => {
    store.setTableOneCell(index, value)
  }, [])

  const handleGetTreeList = useCallback(async (value) => {
    const data = await store.getSkuTreeList({ search: _.toString(value) })
    const res = productSearchFilter(data, store.tableOneExistIds)
    return res
  }, [])

  const handleHighLight = useCallback(
    (data, index) => {
      if (searchIndex !== null && searchIndex === index) {
        return true
      } else {
        return false
      }
    },
    [searchIndex],
  )

  const columns = useMemo(
    () => [
      {
        Header: t('序号'),
        accessor: 'num',
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return <span>{index + 1}</span>
        },
      },
      {
        Header: OperationHeader,
        accessor: 'action',
        diyItemText: t('操作'),
        width: TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          return (
            <OperationHeaderCell
              index={cellProps.row.index}
              onAddRow={handleDetailAdd}
              onDelRow={handleDetailDel}
            />
          )
        },
      },
      {
        Header: t('商品ID'),
        accessor: 'id',
        minWidth: 150,
      },
      {
        Header: t('商品名'),
        accessor: 'sku_name',
        minWidth: 300,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <ProductEditCell
              index={cellProps.row.index}
              onSelect={handleSelectProduct}
              onRequest={handleGetTreeList}
            />
          )
        },
      },
      {
        Header: t('规格'),
        accessor: 'std_unit_name',
        minWidth: 100,
        Cell: (cellProps) => {
          const { original } = cellProps.row
          const { sale_ratio, std_unit_name_forsale, sale_unit_name } = original
          if (sale_ratio && std_unit_name_forsale && sale_unit_name) {
            return (
              <span>
                {`${sale_ratio}${std_unit_name_forsale}/${sale_unit_name}`}
              </span>
            )
          } else {
            return ''
          }
        },
      },
      {
        Header: t('报价单简称'),
        accessor: 'salemenu_name',
        minWidth: 240,
      },
      {
        Header: (
          <div>
            {t('活动库存')}
            <ToolTip
              className='gm-margin-left-5'
              popup={
                <div className='gm-padding-5'>
                  {t('不填写或为0，表示不设置活动库存')}
                </div>
              }
            />
          </div>
        ),
        accessor: 'stock_num',
        minWidth: 100,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <StockEditCell
              index={cellProps.row.index}
              onChange={handleChangeStock}
            />
          )
        },
      },
      {
        Header: t('赠品状态'),
        accessor: 'status',
        minWidth: 100,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <StateEditCell
              index={cellProps.row.index}
              onChange={handleChangeState}
            />
          )
        },
      },
    ],
    [
      handleChangeState,
      handleDetailAdd,
      handleDetailDel,
      handleChangeStock,
      handleSelectProduct,
      handleGetTreeList,
    ],
  )

  const { tableOne, selectedTableOne } = store
  const limit = 9
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, tableOne.length) * TABLE_X.HEIGHT_TR

  return (
    <KeyboardVirtualTable
      onAddRow={handleDetailAdd}
      virtualizedItemSize={TABLE_X.HEIGHT_TR}
      virtualizedHeight={tableHeight}
      data={tableOne.slice()}
      columns={columns}
      keyField='id'
      fixedSelect
      refVirtualized={refList}
      id='buy_gift_step_one_table'
      selected={selectedTableOne.slice()}
      isTrHighlight={handleHighLight}
    />
  )
})

StepOneTable.porpTypes = {
  searchIndex: PropTypes.number,
  refList: PropTypes.object,
}

export default StepOneTable
