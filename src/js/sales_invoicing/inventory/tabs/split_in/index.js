import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import { BoxTable, Price, RightSideModal } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX } from '@gmfe/table-x'
import { Request } from '@gm-common/request'

import store from './store'
import Filter from '../../components/filter'
import TaskList from '../../../../task/task_list'
import Big from 'big.js'

@observer
class SplitIn extends Component {
  paginationRef = createRef()
  dateSelectBox = {
    1: t('分割时间'),
    2: t('审核时间'),
  }

  columns = [
    { Header: t('商品ID'), accessor: 'spu_id' },
    { Header: t('商品名称'), accessor: 'spu_name' },
    { Header: t('商品分类'), accessor: 'category_2_name' },
    { Header: t('分割单号'), accessor: 'split_sheet_no' },
    {
      Header: t('入库数'),
      id: 'in_stock_quantity',
      Cell: (cellProps) => {
        const { in_stock_quantity, std_unit_name } = cellProps.row.original
        return `${Big(in_stock_quantity || 0).toFixed(2)}${std_unit_name}`
      },
    },
    {
      Header: t('入库单价'),
      id: 'in_stock_price',
      Cell: (cellProps) => {
        const { in_stock_price } = cellProps.row.original
        return `${Big(in_stock_price || 0).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: t('入库金额'),
      id: 'in_stock_amount',
      Cell: (cellProps) => {
        const { in_stock_amount } = cellProps.row.original
        return `${Big(in_stock_amount || 0).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: (
        <Observer>
          {() => {
            const {
              filter: { time_type },
            } = store
            return this.dateSelectBox[time_type]
          }}
        </Observer>
      ),
      id: 'audit_time',
      Cell: (cellProps) => (
        <Observer>
          {() => {
            const { split_time, audit_time } = cellProps.row.original
            const {
              filter: { time_type },
            } = store
            const map = {
              1: split_time,
              2: audit_time,
            }
            return map[time_type]
          }}
        </Observer>
      ),
    },
    { Header: t('操作人'), accessor: 'operator' },
  ]

  componentDidMount() {
    store.initFilter()
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleSearch = (params) => {
    const { setFilter } = store
    setFilter(params)
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleExport = async (filter) => {
    const { setFilter, handleFilterParams } = store
    setFilter(filter)
    await Request('/stock/split/in_stock/list')
      .data({
        ...handleFilterParams(),
        export: 1,
      })
      .get()
    RightSideModal.render({
      children: <TaskList />,
      onHide: RightSideModal.hide,
      style: {
        width: '300px',
      },
    })
  }

  handlePageChange = (pagination) => {
    const { fetData } = store
    return fetData({ ...pagination, export: 0 })
  }

  render() {
    const { list, loading } = store
    return (
      <>
        <Filter
          dateSelectBox={this.dateSelectBox}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <BoxTable>
          <ManagePaginationV2
            onRequest={this.handlePageChange}
            ref={this.paginationRef}
          >
            <TableX
              data={list.slice()}
              columns={this.columns}
              loading={loading}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default SplitIn
