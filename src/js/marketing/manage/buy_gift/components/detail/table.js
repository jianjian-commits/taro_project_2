import React, { useMemo, useCallback, useEffect } from 'react'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import { Popover, Flex } from '@gmfe/react'
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

import { detailStore as store } from '../../store'
import { productSearchFilter } from '../../utils'
import OperationHeaderCell from './operation_header_cell'
import ScaleEditCell from './scale_edit_cell'
import ProductEditCell from './product_edit_cell'

const { OperationHeader, TABLE_X } = TableXUtil

const KeyboardVirtualTable = keyboardTableXHOC(
  fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized)),
)

const StepTable = observer(({ searchIndex, refList }) => {
  useEffect(() => {
    // 初始化时，添加一个空行
    store.setTable([{}])
  }, [])

  const handleDetailAdd = useCallback((index) => {
    store.addTableCell(index)
  }, [])

  const handleDetailDel = useCallback((index) => {
    store.delTableCell(index)

    if (store.table.length === 0) {
      // 添加一行新的空行
      handleDetailAdd(0)
    }
  }, [])

  const handleChangeScale = useCallback((value, index) => {
    store.setTableCellData(index, { exchange_ratio: value })
  }, [])

  const handleSelectProduct = useCallback((value, index) => {
    store.setTableCell(index, value)
  }, [])

  const handleRequest = useCallback(async (value) => {
    const data = await store.getSkuTreeList({ search: _.toString(value) })
    const res = productSearchFilter(data, store.tableExistIds)
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
        Header: t('商品名'),
        accessor: 'sku_name',
        minWidth: 300,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <Flex alignCenter>
              <ProductEditCell
                index={cellProps.row.index}
                onRequest={handleRequest}
                onSelect={handleSelectProduct}
                disabled={cellProps.row.original.sku_status === 0}
              />
              {cellProps.row.original.sku_status === 0 ? (
                <Popover
                  showArrow
                  type='hover'
                  left
                  bottom
                  style={{
                    marginLeft: '-3px',
                    marginTop: '3px',
                    fontSize: '12px',
                  }}
                  popup={
                    <div
                      style={{ minWidth: '130px' }}
                      className='gm-padding-10 gm-bg'
                    >
                      {t('商品已删除，请手动删除')}
                    </div>
                  }
                >
                  <span style={{ cursor: 'pointer' }}>
                    <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
                  </span>
                </Popover>
              ) : null}
            </Flex>
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
        Header: t('商品分类'),
        accessor: 'category_1_name',
        minWidth: 240,
        Cell: (cellProps) => {
          const { original } = cellProps.row
          return original.category_1_name ? (
            <span>{`${original.category_1_name}/${original.category_2_name}`}</span>
          ) : null
        },
      },
      {
        Header: t('报价单'),
        accessor: 'salemenu_name',
        minWidth: 240,
      },
      {
        Header: t('兑换比例'),
        accessor: 'name',
        minWidth: 100,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <ScaleEditCell
              index={cellProps.row.index}
              onChange={handleChangeScale}
              disabled={cellProps.row.original.sku_status === 0}
            />
          )
        },
      },
    ],
    [
      handleDetailAdd,
      handleDetailDel,
      handleChangeScale,
      handleRequest,
      handleSelectProduct,
    ],
  )

  const { table } = store
  const limit = 9
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR + Math.min(limit, table.length) * TABLE_X.HEIGHT_TR

  return (
    <KeyboardVirtualTable
      onAddRow={handleDetailAdd}
      virtualizedItemSize={TABLE_X.HEIGHT_TR}
      virtualizedHeight={tableHeight}
      data={table.slice()}
      columns={columns}
      keyField='id'
      fixedSelect
      isTrHighlight={handleHighLight}
      refVirtualized={refList}
      id='buy_gift_step__table'
    />
  )
})

StepTable.propTypes = {
  searchIndex: PropTypes.number,
  refList: PropTypes.object,
}

export default StepTable
