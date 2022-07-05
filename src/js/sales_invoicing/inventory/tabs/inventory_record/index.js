import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import Filter from '../../components/filter'
import { observer, Observer } from 'mobx-react'
import { store } from './store'
import { ManagePagination } from '@gmfe/business'
import { TableX, diyTableXHOC, fixedColumnsTableXHOC } from '@gmfe/table-x'
import { BoxTable, Price, Flex } from '@gmfe/react'
import TableTotalText from 'common/components/table_total_text'
import Big from 'big.js'
import { isNil } from 'lodash'
import SupplierDel from 'common/components/supplier_del_sign'

const DiyFixColumnsTableX = diyTableXHOC(fixedColumnsTableXHOC(TableX))

@observer
class InventoryRecord extends Component {
  paginationRef = createRef()

  dataSelectBox = {
    1: t('提交时间'),
    2: t('入库时间'),
  }

  columns = [
    {
      Header: t('商品ID'),
      diyEnable: false,
      accessor: 'spu_id',
      diyGroupName: t('基础字段'),
      fixed: 'left',
      minWidth: 100,
    },
    {
      Header: t('入库规格ID'),
      diyEnable: false,
      accessor: 'sku_id',
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('入库规格名'),
      diyEnable: false,
      accessor: 'name',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('商品分类'),
      accessor: 'category_name_2',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('入库单号'),
      diyEnable: false,
      accessor: 'sheet_no',
      minWidth: 220,
      Cell: ({
        row: {
          original: { sheet_no },
        },
      }) => (
        <a
          href={`#/sales_invoicing/stock_in/product/detail?id=${sheet_no}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {sheet_no}
        </a>
      ),
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('供应商'),
      diyEnable: false,
      diyGroupName: t('基础字段'),
      minWidth: 160,
      accessor: 'supplier_name',
      Cell: (cellProps) => {
        const { supplier_name, supplier_status } = cellProps.row.original

        return (
          <Flex>
            {supplier_status === 0 && <SupplierDel />}
            {supplier_name}
          </Flex>
        )
      },
    },
    {
      Header: t('入库数'),
      diyEnable: false,
      accessor: 'in_stock_amount',
      Cell: ({
        row: {
          original: { in_stock_amount, std_unit_name },
        },
      }) =>
        `${parseFloat(Big(in_stock_amount || 0).toFixed(2))}${std_unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 80,
    },
    {
      Header: t('入库单价'),
      diyEnable: false,
      accessor: 'price',
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
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('入库金额'),
      diyEnable: false,
      accessor: 'all_price',
      Cell: ({
        row: {
          original: { all_price },
        },
      }) =>
        `${parseFloat(Big(all_price).div(100).toFixed(2))}${Price.getUnit()}`,
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('入库金额（不含税）'),
      id: 'detail_in_money_no_tax',
      diyGroupName: t('基础字段'),
      minWidth: 140,
      Cell: (cellProps) => {
        const { detail_in_money_no_tax } = cellProps.row.original
        if (isNil(detail_in_money_no_tax)) {
          return '-'
        }
        return `${Big(detail_in_money_no_tax)
          .div(100)
          .toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: t('进项税率'),
      id: 'tax_rate',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: (cellProps) => {
        const { tax_rate } = cellProps.row.original
        if (isNil(tax_rate)) {
          return '-'
        }
        return `${Big(tax_rate).div(100).toFixed(2)}%`
      },
    },
    {
      Header: t('进项税额'),
      id: 'tax_money',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: (cellProps) => {
        const { tax_money } = cellProps.row.original
        if (isNil(tax_money)) {
          return '-'
        }
        return `${Big(tax_money).div(100).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: () => (
        <Observer>
          {() => {
            const {
              filter: { time_type },
            } = store
            return this.dataSelectBox[time_type]
          }}
        </Observer>
      ),
      accessor: 'time_type',
      diyItemText: (
        <Observer>
          {() => {
            const {
              filter: { time_type },
            } = store
            return this.dataSelectBox[time_type]
          }}
        </Observer>
      ),
      minWidth: 120,
      Cell: ({
        row: {
          original: { submit_time, commit_time },
        },
      }) => (
        <Observer>
          {() => {
            const {
              filter: { time_type },
            } = store
            return time_type === 2 ? submit_time : commit_time
          }}
        </Observer>
      ),
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('操作人'),
      accessor: 'operator',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('商品备注'),
      accessor: 'remark',
      diyGroupName: t('基础字段'),
      minWidth: 160,
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
    store.export(Object.assign({ export: 1 }, filter))
  }

  handlePageChange = (pagination) => {
    const { filter, fetchData } = store
    return fetchData(Object.assign(filter, pagination))
  }

  render() {
    const { pagination, loading, list } = store
    return (
      <>
        <Filter
          dateSelectBox={this.dataSelectBox}
          hasSupplier
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          onRequest={this.handlePageChange}
          id='inventory_record'
          ref={this.paginationRef}
        >
          <BoxTable
            info={
              <TableTotalText
                data={
                  pagination?.count === -1
                    ? []
                    : [
                        {
                          label: t('明细总数'),
                          content: pagination?.count || 0,
                        },
                      ]
                }
              />
            }
          >
            <DiyFixColumnsTableX
              id='inventory_record'
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

export default InventoryRecord
