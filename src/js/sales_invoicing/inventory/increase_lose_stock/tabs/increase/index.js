import React, { Component, createRef } from 'react'
import Filter from '../../../components/filter'
import { i18next, t } from 'gm-i18n'
import { ManagePagination } from '@gmfe/business'
import { TableX, diyTableXHOC, fixedColumnsTableXHOC } from '@gmfe/table-x'
import Big from 'big.js'
import { Price } from '@gmfe/react'
import moment from 'moment'
import { store } from './store'
import { urlToParams } from 'common/util'
import { observer } from 'mobx-react'

const DiyFixedColumnsTableX = diyTableXHOC(fixedColumnsTableXHOC(TableX))

@observer
class Increase extends Component {
  paginationRef = createRef()

  columns = [
    {
      diyEnable: false,
      Header: i18next.t('商品ID'),
      accessor: 'spu_id',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      fixed: 'left',
    },
    {
      Header: i18next.t('商品名'),
      diyEnable: false,
      accessor: 'name',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: i18next.t('商品分类'),
      accessor: 'category_name_2',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: i18next.t('报溢数'),
      diyEnable: false,
      accessor: 'increase_amount',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({
        row: {
          original: { increase_amount, std_unit_name },
        },
      }) =>
        `${parseFloat(Big(increase_amount || 0).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: i18next.t('报溢单价'),
      diyEnable: false,
      accessor: 'price',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({
        row: {
          original: { price, std_unit_name },
        },
      }) =>
        `${parseFloat(
          Big(price || 0)
            .div(100)
            .toFixed(2),
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: i18next.t('报溢金额'),
      diyEnable: false,
      accessor: 'money',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({
        row: {
          original: { increase_amount, price },
        },
      }) =>
        `${parseFloat(
          Big(price || 0)
            .times(increase_amount || 0)
            .div(100)
            .toFixed(2),
        )}${Price.getUnit()}`,
    },
    {
      Header: t('报溢金额（不含税）'),
      accessor: 'increase_money_no_tax',
      minWidth: 160,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.increase_money_no_tax || 0).toFixed(
          2,
        )}${Price.getUnit()}`,
    },
    {
      Header: t('进项税率'),
      accessor: 'tax_rate',
      minWidth: 120,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.tax_rate).div(100).toFixed(2)}%`,
    },
    {
      Header: t('进项税额'),
      accessor: 'tax_money',
      minWidth: 120,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.tax_money).toFixed(2)}${Price.getUnit()}`,
    },
    {
      Header: i18next.t('抄盘数'),
      diyEnable: false,
      accessor: 'old_stock',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({
        row: {
          original: { old_stock, std_unit_name },
        },
      }) => `${parseFloat(Big(old_stock || 0).toFixed(2)) + std_unit_name}`,
    },
    {
      Header: i18next.t('实盘数'),
      accessor: 'r',
      diyEnable: false,
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({
        row: {
          original: { old_stock, increase_amount, std_unit_name },
        },
      }) =>
        `${parseFloat(
          Big(old_stock || 0)
            .plus(increase_amount || 0)
            .toFixed(2),
        )}${std_unit_name}`,
    },
    {
      Header: i18next.t('报溢时间'),
      accessor: 'create_time',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({
        row: {
          original: { create_time },
        },
      }) => moment(create_time).format('YYYY-MM-DD'),
    },
    {
      Header: i18next.t('操作人'),
      accessor: 'operator',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: i18next.t('备注'),
      accessor: 'remark',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
  ]

  componentDidMount() {
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleSearch = (filter) => {
    const { setFilter } = store
    setFilter(filter)
    this.paginationRef.current.apiDoFirstRequest()
  }

  handleExport = (filter) => {
    const { setFilter } = store
    setFilter(filter)
    window.open(`/stock/increase?export=1&${urlToParams(filter)}`)
  }

  handlePageChange = (pagination) => {
    const { filter, fetchData } = store
    return fetchData(Object.assign(filter, pagination))
  }

  render() {
    const { loading, list } = store
    return (
      <>
        <Filter
          dateSelectBox={t('报溢时间')}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          id='increase'
          onRequest={this.handlePageChange}
          ref={this.paginationRef}
        >
          <DiyFixedColumnsTableX
            id='increase'
            diyGroupSorting={[t('基础字段')]}
            data={list.slice()}
            columns={this.columns}
            loading={loading}
          />
        </ManagePagination>
      </>
    )
  }
}

export default Increase
