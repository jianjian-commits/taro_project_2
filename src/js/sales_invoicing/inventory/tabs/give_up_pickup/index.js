import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import Filter from '../../components/filter'
import moment from 'moment'
import { isNil } from 'lodash'
import { store } from './store'
import { observer } from 'mobx-react'
import { ManagePagination } from '@gmfe/business'
import { BoxTable, Price } from '@gmfe/react'
import { TableX, fixedColumnsTableXHOC, diyTableXHOC } from '@gmfe/table-x'
import TableTotalText from 'common/components/table_total_text'
import { urlToParams } from 'common/util'
import Big from 'big.js'

const DiyFixedColumnsTableX = fixedColumnsTableXHOC(diyTableXHOC(TableX))

@observer
class GiveUpPickup extends Component {
  paginationRef = createRef()

  columns = [
    {
      Header: t('商品ID'),
      accessor: 'spu_id',
      minWidth: 120,
      diyEnable: false,
      fixed: 'left',
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('退货商品名'),
      accessor: 'spu_name',
      minWidth: 160,
      diyEnable: false,
      fixed: 'left',
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('商品分类'),
      accessor: 'category_name_2',
      minWidth: 120,
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('退货单号'),
      accessor: 'order_id',
      diyEnable: false,
      minWidth: 160,
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('应退数'),
      accessor: 'request_amount',
      diyEnable: false,
      minWidth: 120,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { std_unit, request_amount },
        },
      }) => (
        <span>
          {request_amount} {std_unit}
        </span>
      ),
    },
    {
      Header: t('应退金额'),
      accessor: 'request_refund_money',
      diyEnable: false,
      minWidth: 140,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { request_refund_money },
        },
      }) => (
        <span>
          {/* todo 后端说单位写死 */}
          {request_refund_money} {t('元')}
        </span>
      ),
    },
    {
      Header: t('应退金额（不含税）'),
      id: 'abandon_money_no_tax',
      minWidth: 160,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { abandon_money_no_tax } = cellProps.row.original
        if (isNil(abandon_money_no_tax)) {
          return '-'
        }
        return `${Big(abandon_money_no_tax).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: t('销项税率'),
      id: 'tax_rate',
      minWidth: 120,
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
      Header: t('销项税额'),
      id: 'tax_money',
      minWidth: 120,
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { tax_money } = cellProps.row.original
        if (isNil(tax_money)) {
          return '-'
        }
        return `${Big(tax_money).toFixed(2)}${Price.getUnit()}`
      },
    },
    {
      Header: t('放弃时间'),
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
      Header: t('操作人'),
      accessor: 'operator',
      minWidth: 100,
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
    const { text, ...rest } = filter
    window.open(
      `/stock/abandon_goods/log/export?${urlToParams({ q: text, ...rest })}`,
    )
  }

  handlePageChange = (pagination) => {
    const { fetchData, filter } = store
    const { text, ...rest } = filter
    return fetchData(Object.assign(pagination, rest, { q: text, count: 1 }))
  }

  render() {
    const { list, loading, pagination } = store
    return (
      <>
        <Filter
          dateSelectBox={t('放弃时间')}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          onRequest={this.handlePageChange}
          id='give_up_pickup'
          ref={this.paginationRef}
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
              id='give_up_pickup'
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

export default GiveUpPickup
