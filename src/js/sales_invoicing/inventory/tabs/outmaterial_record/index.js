import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import Filter from '../../components/filter'
import { observer } from 'mobx-react'
import { store } from './store'
import { Flex, ToolTip } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { TableX, diyTableXHOC, fixedColumnsTableXHOC } from '@gmfe/table-x'
import { BoxTable, Price } from '@gmfe/react'
import TableTotalText from 'common/components/table_total_text'
import Big from 'big.js'

const DiyFixColumnsTableX = diyTableXHOC(fixedColumnsTableXHOC(TableX))

@observer
class InventoryRecord extends Component {
  paginationRef = createRef()

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
      accessor: 'sku_name',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('商品分类'),
      accessor: 'category2_name',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('计划编号'),
      diyEnable: false,
      accessor: 'proc_order_custom_id',
      minWidth: 220,
      diyGroupName: t('基础字段'),
    },

    {
      Header: t('入库数'),
      diyEnable: false,
      accessor: 'amount',
      Cell: ({
        row: {
          original: { amount, unit_name },
        },
      }) => `${parseFloat(Big(amount || 0).toFixed(2))}${unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 80,
    },
    {
      Header: (
        <Flex alignCenter>
          {t('入库均价')}
          <ToolTip
            top
            popup={
              <div className='gm-padding-5'>
                {t('入库均价=入库金额/入库数')}
              </div>
            }
          />
        </Flex>
      ),
      diyEnable: false,
      accessor: 'avg_price',
      Cell: ({
        row: {
          original: { avg_price, unit_name },
        },
      }) =>
        `${parseFloat(
          Big(avg_price).toFixed(2),
        )}${Price.getUnit()}/${unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('入库金额'),
      diyEnable: false,
      accessor: 'money',
      Cell: ({
        row: {
          original: { money },
        },
      }) => `${parseFloat(Big(money).toFixed(2))}${Price.getUnit()}`,
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('领料人'),
      accessor: 'recver',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      Cell: ({ row: { original } }) => original.recver || '-',
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
    store.export(Object.assign({ async: 1, export: 1 }, filter))
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
          hasRecver
          dateSelectBox={t('退料日期')}
          labelWidth='90px'
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
                data={[
                  {
                    label: t('明细总数'),
                    content: pagination?.count || 0,
                  },
                ]}
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
