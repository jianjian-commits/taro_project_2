import React, { Component, createRef } from 'react'
import Filter from '../../components/filter'
import { i18next, t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { store } from './store'
import Big from 'big.js'
import { BoxTable, Price } from '@gmfe/react'
import moment from 'moment'
import { ManagePagination } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import { TableX, diyTableXHOC, fixedColumnsTableXHOC } from '@gmfe/table-x'
import { urlToParams } from 'common/util'

const DiyFixedColumnsTableX = diyTableXHOC(fixedColumnsTableXHOC(TableX))

@observer
class InventoryReturn extends Component {
  paginationRef = createRef()

  columns = [
    {
      Header: i18next.t('商品ID'),
      diyEnable: false,
      accessor: 'spu_id',
      minWidth: 140,
      fixed: 'left',
      diyGroupName: t('基础字段'),
    },
    {
      Header: i18next.t('退货商品名'),
      diyEnable: false,
      accessor: 'name',
      minWidth: 140,
      fixed: 'left',
      diyGroupName: t('基础字段'),
    },
    {
      Header: i18next.t('商品分类'),
      accessor: 'category_name_2',
      minWidth: 140,
      diyGroupName: t('基础字段'),
    },
    {
      Header: i18next.t('退货单号'),
      accessor: 'order_id',
      diyEnable: false,
      minWidth: 120,
      diyGroupName: t('基础字段'),
    },
    {
      Header: i18next.t('入库数'),
      diyEnable: false,
      accessor: 'in_stock_amount',
      minWidth: 100,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { in_stock_amount, std_unit_name },
        },
      }) =>
        `${parseFloat(Big(in_stock_amount || 0).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: i18next.t('入库单价'),
      diyEnable: false,
      accessor: 'price',
      minWidth: 100,
      diyGroupName: t('基础字段'),
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
      Header: i18next.t('入库金额'),
      accessor: 'price',
      diyGroupName: t('基础字段'),
      diyEnable: false,
      minWidth: 100,
      Cell: ({
        row: {
          original: { price, in_stock_amount },
        },
      }) =>
        `${parseFloat(
          Big(price || 0)
            .times(in_stock_amount || 0)
            .div(100)
            .toFixed(2),
        )}${Price.getUnit()}`,
    },
    {
      Header: i18next.t('销售价'),
      accessor: 'std_sale_price',
      diyEnable: false,
      minWidth: 100,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { std_sale_price, std_unit_name },
        },
      }) =>
        `${parseFloat(
          Big(std_sale_price).div(100).toFixed(2),
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: i18next.t('销售金额'),
      accessor: 'money',
      diyEnable: false,
      minWidth: 120,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { accept_std_count, std_sale_price },
        },
      }) =>
        `${parseFloat(
          Big(std_sale_price || 0)
            .times(accept_std_count || 0)
            .div(100)
            .toFixed(2),
        )}${Price.getUnit()}`,
    },
    {
      Header: t('销售金额（不含税）'),
      accessor: 'refund_in_money_no_tax',
      minWidth: 160,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.refund_in_money_no_tax || 0).toFixed(
          2,
        )}${Price.getUnit()}`,
    },
    {
      Header: t('销项税率'),
      accessor: 'tax_rate',
      minWidth: 120,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.tax_rate || 0)
          .div(100)
          .toFixed(2)}%`,
    },
    {
      Header: t('销项税额'),
      accessor: 'tax_money',
      minWidth: 120,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) =>
        `${Big(cellProps.row.original.tax_money || 0).toFixed(
          2,
        )}${Price.getUnit()}`,
    },
    {
      Header: i18next.t('入库时间'),
      accessor: 'create_time',
      minWidth: 140,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { create_time },
        },
      }) => moment(create_time).format('YYYY-MM-DD'),
    },
    {
      Header: i18next.t('操作人'),
      accessor: 'operator',
      minWidth: 120,
      diyGroupName: t('基础字段'),
    },
  ]

  componentDidMount() {
    store.initFilter()
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
    window.open(`/stock/refund_stock_sku?export=1&${urlToParams(filter)}`)
  }

  handlePageChange = (pagination) => {
    const { fetchData, filter } = store
    return fetchData(Object.assign(filter, pagination))
  }

  render() {
    const { list, loading, pagination } = store
    return (
      <>
        <Filter
          dateSelectBox={t('退货入库时间')}
          labelWidth='90px'
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          onRequest={this.handlePageChange}
          ref={this.paginationRef}
          id='inventory_return'
        >
          <BoxTable
            info={
              <TableTotalText
                data={[
                  {
                    label: t('明细总数'),
                    content: pagination?.count || 0,
                  },
                ]}
              />
            }
          >
            <DiyFixedColumnsTableX
              id='inventory_return'
              diyGroupSorting={[t('基础字段')]}
              data={list.slice()}
              columns={this.columns}
              loading={loading}
            />
          </BoxTable>
        </ManagePagination>
      </>
    )
  }
}

export default InventoryReturn
