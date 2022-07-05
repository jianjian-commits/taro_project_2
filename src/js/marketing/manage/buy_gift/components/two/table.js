import React, { useMemo, useCallback, useEffect } from 'react'
import { keyboardTableXHOC } from '@gmfe/keyboard'
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
import ScaleEditCell from './scale_edit_cell'
import ProductEditCell from './product_edit_cell'

const { OperationHeader, TABLE_X } = TableXUtil

const KeyboardVirtualTable = keyboardTableXHOC(
  fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized)),
)

const StepTwoTable = observer(({ searchIndex, refList }) => {
  useEffect(() => {
    // 初始化时，添加一个空行
    store.setTableTwo([{}])
  }, [])

  const handleDetailAdd = useCallback((index) => {
    store.addTableTwoCell(index)
  }, [])

  const handleDetailDel = useCallback((index) => {
    store.delTableTwoCell(index)

    if (store.tableTwo.length === 0) {
      // 添加一行新的空行
      handleDetailAdd(0)
    }
  }, [])

  const handleChangeState = useCallback((value, index) => {
    store.setTableTwoCellData(index, { status: value })
  }, [])

  const handleChangeScale = useCallback((value, index) => {
    store.setTableTwoCellData(index, { exchange_ratio: value })
  }, [])

  const handleSelectProduct = useCallback((value, index) => {
    store.setTableTwoCell(index, value)
  }, [])

  const handleRequest = useCallback(async (value) => {
    const data = await store.getSkuTreeList({ search: _.toString(value) })
    const res = productSearchFilter(data, store.tableTwoExistIds)
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
            <ProductEditCell
              index={cellProps.row.index}
              onSelect={handleSelectProduct}
              onRequest={handleRequest}
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
        Header: t('商品分类'),
        accessor: 'salemenu_name',
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
            />
          )
        },
      },
    ],
    [
      handleChangeState,
      handleDetailAdd,
      handleDetailDel,
      handleChangeScale,
      handleSelectProduct,
      handleRequest,
    ],
  )

  const { tableTwo } = store
  const limit = 9
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, tableTwo.length) * TABLE_X.HEIGHT_TR

  return (
    <KeyboardVirtualTable
      onAddRow={handleDetailAdd}
      virtualizedItemSize={TABLE_X.HEIGHT_TR}
      virtualizedHeight={tableHeight}
      data={tableTwo.slice()}
      columns={columns}
      keyField='id'
      fixedSelect
      isTrHighlight={handleHighLight}
      refVirtualized={refList}
      id='buy_gift_step_two_table'
    />
  )
})

StepTwoTable.propTypes = {
  searchIndex: PropTypes.number,
  refList: PropTypes.object,
}

export default StepTwoTable
