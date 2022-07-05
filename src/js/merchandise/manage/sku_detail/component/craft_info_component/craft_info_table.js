import { i18next, t } from 'gm-i18n'
import React, { useCallback } from 'react'
import { observer, Observer } from 'mobx-react'
import skuStore from '../../sku_store'
import { Flex, ToolTip } from '@gmfe/react'
import {
  editTableXHOC,
  TableXUtil,
  TableXVirtualized,
  fixedColumnsTableXHOC,
} from '@gmfe/table-x'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import { remarkType } from '../../../../../common/filter'
import CellEditOperation from './cell_edit_operation'
import CellName from './cell_name'
import RefTypeHeader from './ref_type_header'
import CellProportion from './cell_proportion'
import CellSaleProportion from './cell_sale_proportion'
import CellSupplier from './cell_supplier'
import CellRefType from './cell_ref_type'
import CellTechnicNum from './cell_technic_num'
import CellRatio from './cell_ratio'
import CellProcessUnitName from './cell_process_unit_name'
import ProportionHeader from './proportion_header'

const KeyboardTable = keyboardTableXHOC(
  fixedColumnsTableXHOC(editTableXHOC(TableXVirtualized))
)
const { OperationHeader, TABLE_X } = TableXUtil

const CraftInfoTable = observer(() => {
  const {
    skuDetail: {
      ingredients,
      sku_id,
      clean_food_info: { process_unit_status },
    },
  } = skuStore

  const handleAddRow = useCallback(() => skuStore.addNewIngredient(), [])
  const handleChangeTechnicFlowLen = useCallback(
    ({ index, len }) =>
      skuStore.changeIngredients(index, { technic_flow_len: len }),
    []
  )

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns = React.useMemo(() => {
    return [
      {
        accessor: 'operation',
        Header: OperationHeader,
        width: TABLE_X.WIDTH_OPERATION,
        fixed: 'left',
        Cell: (cellProps) => {
          return (
            <CellEditOperation
              index={cellProps.row.index}
              onAddRow={handleAddRow}
            />
          )
        },
      },
      {
        Header: t('物料名'),
        accessor: 'name',
        minWidth: 180,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellName index={cellProps.row.index} />
        },
      },
      {
        Header: t('商品类型'),
        accessor: 'remark_type',
        minWidth: 80,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const { id, remark_type } = cellProps.row.original
                return id ? remarkType(remark_type) : '-'
              }}
            </Observer>
          )
        },
      },
      {
        Header: <RefTypeHeader />,
        minWidth: 120,
        accessor: 'refRatio',
        Cell: (cellProps) => {
          return <CellRefType index={cellProps.row.index} />
        },
      },
      process_unit_status && {
        Header: i18next.t('加工计量单位'),
        accessor: 'process_unit_name',
        minWidth: 100,
        Cell: (cellProps) => {
          return <CellProcessUnitName index={cellProps.row.index} />
        },
      },
      {
        Header: <ProportionHeader />,
        accessor: 'proportion',
        minWidth: 120,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellProportion index={cellProps.row.index} />
        },
      },
      {
        Header: i18next.t('规格'),
        accessor: 'ratio',
        minWidth: 60,
        Cell: (cellProps) => {
          return <CellRatio index={cellProps.row.index} />
        },
      },
      !process_unit_status && {
        Header: (
          <Flex alignCenter>
            <span>
              {i18next.t('单位数量')}
              <br />
              {`(${i18next.t('包装单位')})`}
            </span>
          </Flex>
        ),
        accessor: 'sale_proportion',
        minWidth: 120,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellSaleProportion index={cellProps.row.index} />
        },
      },
      {
        Header: (
          <Flex alignCenter>
            <span>{i18next.t('默认供应商')}</span>
            <ToolTip
              popup={
                <div className='gm-margin-5'>
                  {i18next.t(
                    '所选物料类型为原料时可选择供应商，非原料类型无需选择供应商。'
                  )}
                </div>
              }
            />
          </Flex>
        ),
        minWidth: 180,
        accessor: 'supplier_id',
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CellSupplier index={cellProps.row.index} />
        },
      },
      {
        Header: i18next.t('工艺数'),
        accessor: 'technic_flow_len',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <CellTechnicNum
              sku_id={sku_id}
              index={cellProps.row.index}
              onChangeTechnicFlowLen={handleChangeTechnicFlowLen}
            />
          )
        },
      },
    ].filter((v) => v)
  }, [sku_id, handleAddRow, handleChangeTechnicFlowLen, process_unit_status])

  const limit = 5
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, ingredients.length) * TABLE_X.HEIGHT_TR

  return (
    <KeyboardTable
      tiled
      id='skudetail_crafe_info_table'
      keyField='id'
      onAddRow={handleAddRow}
      virtualizedHeight={tableHeight}
      virtualizedItemSize={TableXUtil.TABLE_X.HEIGHT_TR}
      data={ingredients.slice()}
      columns={columns}
    />
  )
})

export default CraftInfoTable
