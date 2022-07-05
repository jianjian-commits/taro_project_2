import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import {
  TableXVirtualized,
  selectTableXHOC,
  editTableXHOC,
  TableXUtil,
} from '@gmfe/table-x'
import store from '../../store'
import { t } from 'gm-i18n'
import TextAreaCell from './text_area_cell'
import SuggestPlanAmountCell from './suggest_plan_amout_cell'
import SortHeader from './sort_header'

const { TABLE_X } = TableXUtil
const SelectRecommendTable = selectTableXHOC(editTableXHOC(TableXVirtualized))

const RecommendTable = observer(() => {
  const { recommendProcessPlanList, recommendSelected } = store

  const columns = useMemo(
    () => [
      {
        Header: t('序号'),
        accessor: 'num',
        Cell: (cellProps) => {
          return cellProps.row.index + 1
        },
      },
      {
        Header: <SortHeader field='product' />,
        accessor: 'product',
        Cell: (cellProps) => {
          return <TextAreaCell field='product' index={cellProps.row.index} />
        },
      },
      {
        Header: <SortHeader field='category_name' />,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell field='category' index={cellProps.row.index} />
        },
      },
      {
        Header: t('销售规格'),
        accessor: 'sale_ratio',
        Cell: (cellProps) => {
          return <TextAreaCell field='sale_ratio' index={cellProps.row.index} />
        },
      },
      {
        Header: t('成品库存数'),
        accessor: 'sale_remain',
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='sale_remain' index={cellProps.row.index} />
          )
        },
      },
      {
        Header: t('建议计划生产数'),
        accessor: 'suggest_plan_amount',
        Cell: (cellProps) => {
          return <SuggestPlanAmountCell index={cellProps.row.index} />
        },
      },
    ],
    []
  )

  const handleSelect = (selected) => {
    store.changeRecommendSelected(selected)
  }

  const limit = 10
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, recommendProcessPlanList.length) * TABLE_X.HEIGHT_TR

  return (
    <SelectRecommendTable
      data={recommendProcessPlanList.slice()}
      columns={columns}
      keyField='sku_id'
      selected={recommendSelected.slice()}
      onSelect={handleSelect}
      virtualizedItemSize={TABLE_X.HEIGHT_TR}
      virtualizedHeight={tableHeight}
      id='recommend_edit_table'
      className='gm-margin-top-20'
    />
  )
})

export default RecommendTable
