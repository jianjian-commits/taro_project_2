import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import { TableX } from '@gmfe/table-x'
import { BoxTable, Price, RightSideModal } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Request } from '@gm-common/request'

import Filter from '../../components/filter'
import store from './store'
import TaskList from '../../../../task/task_list'
import Big from 'big.js'

@observer
class SplitOut extends Component {
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
      Header: t('出库数'),
      id: 'out_stock_quantity',
      Cell: (cellProps) => {
        const { out_stock_quantity, std_unit_name } = cellProps.row.original
        return `${Big(out_stock_quantity || 0).toFixed(2)}${std_unit_name}`
      },
    },
    {
      Header: t('出库单价'),
      id: 'out_stock_price',
      Cell: (cellProps) => {
        const { out_stock_price } = cellProps.row.original
        return `${Big(out_stock_price || 0).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: t('出库金额'),
      id: 'out_stock_amount',
      Cell: (cellProps) => {
        const { out_stock_amount } = cellProps.row.original
        return `${Big(out_stock_amount || 0).toFixed(2)}${Price.getUnit()}`
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
    await Request('/stock/split/out_stock/list')
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
    const { fetchData } = store
    return fetchData({ ...pagination, export: 0 })
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

export default SplitOut
