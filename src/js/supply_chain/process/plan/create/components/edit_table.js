import React, { useMemo, useCallback, useEffect } from 'react'
import store from '../store'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import OperationHeaderCell from './operation_header_cell'
import CustomIdCell from './custom_id_cell'
import ProductNameCell from './product_name_cell'
import TextAreaCell from './text_area_cell'
import SuggestPlanAmountHeader from './suggest_plan_amount_header'
import PlanAmountCell from './plan_amount_cell'
import PlanDateCell from './plan_date_cell'
import {
  editTableXHOC,
  fixedColumnsTableXHOC,
  TableXVirtualized,
  TableXUtil,
} from '@gmfe/table-x'
const { OperationHeader, TABLE_X } = TableXUtil

const EditFixedKeyboardTable = fixedColumnsTableXHOC(
  keyboardTableXHOC(editTableXHOC(TableXVirtualized))
)

const PlanEditTable = observer(() => {
  const { processPlanList } = store

  useEffect(() => {
    store.initAutoRun()

    return store.clearEditTable
  }, [])

  const handleDetailAdd = useCallback(() => {
    store.addProcessPlanListItem()
  }, [])

  const columns = useMemo(
    () => [
      {
        Header: t('序号'),
        accessor: 'num',
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          const { index } = cellProps.row
          return index + 1
        },
      },
      {
        Header: OperationHeader,
        accessor: 'action',
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
        Header: t('计划编号'),
        accessor: 'custom_id',
        minWidth: 160,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <CustomIdCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('生成成品'),
        accessor: 'product_name',
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ProductNameCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('销售规格'),
        accessor: 'sale_ratio',
        minWidth: 100,
        Cell: (cellProps) => {
          return <TextAreaCell index={cellProps.row.index} field='sale_ratio' />
        },
      },
      {
        Header: <SuggestPlanAmountHeader />,
        accessor: 'suggest_plan_amount',
        minWidth: 120,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              index={cellProps.row.index}
              field='suggest_plan_amount'
            />
          )
        },
      },
      {
        Header: t('计划生产数'),
        accessor: 'plan_amount',
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          return <PlanAmountCell index={cellProps.row.index} />
        },
      },
      {
        Header: t('成品库存数'),
        accessor: 'sale_remain',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <TextAreaCell index={cellProps.row.index} field='sale_remain' />
          )
        },
      },
      {
        Header: t('计划开始时间'),
        accessor: 'plan_start_time',
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return (
            <PlanDateCell index={cellProps.row.index} field='plan_start_time' />
          )
        },
      },
      {
        Header: t('计划完成时间'),
        accessor: 'plan_finish_time',
        isKeyboard: true,
        minWidth: 160,
        Cell: (cellProps) => {
          return (
            <PlanDateCell
              index={cellProps.row.index}
              field='plan_finish_time'
            />
          )
        },
      },
    ],
    [handleDetailAdd]
  )

  const limit = 10
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, processPlanList.length) * TABLE_X.HEIGHT_TR

  return (
    <EditFixedKeyboardTable
      data={processPlanList.slice()}
      columns={columns}
      onAddRow={handleDetailAdd}
      id='plan_edit_table'
      virtualizedItemSize={TABLE_X.HEIGHT_TR}
      virtualizedHeight={tableHeight}
    />
  )
})

export default PlanEditTable
