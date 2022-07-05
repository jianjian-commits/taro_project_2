import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import Filter from '../../components/filter'
import { observer, Observer } from 'mobx-react'
import { store } from './store'
import Big from 'big.js'
import { BoxTable, Price } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import { isNil } from 'lodash'
import { TableX, fixedColumnsTableXHOC, diyTableXHOC } from '@gmfe/table-x'
import { urlToParams } from 'common/util'

const FixedColumnsDiyTableX = fixedColumnsTableXHOC(diyTableXHOC(TableX))

@observer
class OutboundReturn extends Component {
  dateSelectBox = {
    1: t('提交时间'),
    2: t('退货出库时间'),
  }

  paginationRef = createRef()

  columns = [
    {
      Header: t('商品ID'),
      diyEnable: false,
      accessor: 'spu_id',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      fixed: 'left',
    },

    {
      Header: t('退货规格ID'),
      diyEnable: false,
      accessor: 'sku_id',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('退货规格名'),
      diyEnable: false,
      accessor: 'name',
      diyGroupName: t('基础字段'),
      minWidth: 160,
    },
    {
      Header: t('商品分类'),
      accessor: 'category_name_2',
      diyGroupName: t('基础字段'),
      minWidth: 200,
    },
    {
      Header: t('退货单号'),
      diyEnable: false,
      accessor: 'sheet_no',
      Cell: ({
        row: {
          original: { sheet_no },
        },
      }) => (
        <a
          href={`#/sales_invoicing/stock_out/refund/detail/${sheet_no}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {sheet_no}
        </a>
      ),
      diyGroupName: t('基础字段'),
      minWidth: 300,
    },
    {
      Header: t('退货数'),
      diyEnable: false,
      accessor: 'return_amount',
      Cell: ({
        row: {
          original: { return_amount, std_unit_name },
        },
      }) => `${parseFloat(Big(return_amount || 0).toFixed(2))}${std_unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('退货单价'),
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
        )}${Price.getUnit()}${std_unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('退货金额'),
      diyEnable: false,
      accessor: 'all_price',
      Cell: ({
        row: {
          original: { all_price },
        },
      }) =>
        `${parseFloat(Big(all_price).div(100).toFixed(2))}${Price.getUnit()}`,
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('退货金额（不含税）'),
      accessor: 'refund_out_money_no_tax',
      minWidth: 140,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { refund_out_money_no_tax } = cellProps.row.original
        if (isNil(refund_out_money_no_tax)) {
          return '-'
        }
        return `${Big(refund_out_money_no_tax).div(100).toFixed(2)}`
      },
    },
    {
      Header: t('进项税率'),
      accessor: 'tax_rate',
      minWidth: 100,
      diyGroupName: t('基础字段'),
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
      accessor: 'tax_money',
      minWidth: 100,
      diyGroupName: t('基础字段'),
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
            return this.dateSelectBox[time_type]
          }}
        </Observer>
      ),
      accessor: 'time_type',
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
      minWidth: 120,
      diyItemText: (
        <Observer>
          {() => {
            const {
              filter: { time_type },
            } = store
            return this.dateSelectBox[time_type]
          }}
        </Observer>
      ),
    },
    {
      Header: t('操作人'),
      accessor: 'operator',
      diyGroupName: t('基础字段'),
      minWidth: 120,
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
    window.open(`/stock/return_supply_sku?export=1&${urlToParams(filter)}`)
  }

  handlePageChange = (pagination) => {
    const { filter, fetchData } = store
    return fetchData(Object.assign(filter, pagination))
  }

  render() {
    const { pagination, list, loading } = store
    return (
      <>
        <Filter
          dateSelectBox={this.dateSelectBox}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          id='outbound_return'
          ref={this.paginationRef}
          onRequest={this.handlePageChange}
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
            <FixedColumnsDiyTableX
              id='outbound_return'
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

export default OutboundReturn
