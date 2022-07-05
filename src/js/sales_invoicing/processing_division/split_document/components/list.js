import React, { Component } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import Big from 'big.js'
import global from 'stores/global'
import { TableX, fixedColumnsTableXHOC, TableXUtil } from '@gmfe/table-x'
import { BoxTable, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import moment from 'moment'
import store from '../stores/store'
import OperationCell from './operation_cell'
import StatusCell from './status_cell'

const { TABLE_X, OperationHeader } = TableXUtil
const { WIDTH_OPERATION } = TABLE_X
const FixedColumnsTableX = fixedColumnsTableXHOC(TableX)

@observer
class List extends Component {
  columns = [
    {
      Header: t('分割时间'),
      accessor: 'split_time',
      Cell: (cellProps) =>
        moment(cellProps.row.original.split_time).format('YYYY-MM-DD'),
    },
    { Header: t('分割单号'), accessor: 'split_sheet_no', width: 240 },
    { Header: t('分割方案'), accessor: 'plan_name' },
    { Header: t('待分割品'), accessor: 'source_spu_name' },
    { Header: t('单位'), accessor: 'std_unit_name' },
    {
      Header: t('待分割品消耗量'),
      accessor: 'source_quantity',
      Cell: (cellProps) =>
        this.renderQuantity(cellProps.row.original.source_quantity),
    },
    {
      Header: t('获得品总量'),
      accessor: 'remain_quantity',
      Cell: (cellProps) =>
        this.renderQuantity(cellProps.row.original.remain_quantity),
    },
    {
      Header: t('分割损耗'),
      accessor: 'loss_quantity',
      Cell: (cellProps) =>
        this.renderQuantity(cellProps.row.original.loss_quantity),
    },
    {
      Header: t('状态'),
      accessor: 'status',
      Cell: (cellProps) => <StatusCell index={cellProps.row.index} />,
    },
    { Header: t('操作人'), accessor: 'operator' },
    {
      Header: OperationHeader,
      width: WIDTH_OPERATION * 2,
      accessor: 'operation',
      Cell: (cellProps) => <OperationCell index={cellProps.row.index} />,
    },
  ]

  renderQuantity = (quantity) => {
    return Big(quantity).toFixed(2)
  }

  handlePageChange = (pagination) => {
    const { searchFilter, fetchList } = store
    return fetchList(Object.assign({}, searchFilter, pagination))
  }

  handleCreate = () => {
    window.open('/#/sales_invoicing/processing_division/split_document/create')
  }

  render() {
    const { paginationRef, list, loading } = store
    return (
      <BoxTable
        action={
          global.hasPermission('add_split_sheet') && (
            <Button type='primary' onClick={this.handleCreate}>
              {t('新建分割单据')}
            </Button>
          )
        }
      >
        <ManagePaginationV2
          onRequest={this.handlePageChange}
          ref={paginationRef}
        >
          <FixedColumnsTableX
            columns={this.columns}
            data={list.slice()}
            loading={loading}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}
export default List
