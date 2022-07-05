import React, { Component, createRef } from 'react'
import { t } from 'gm-i18n'
import Filter from '../../components/filter'
import { store } from './store'
import { observer } from 'mobx-react'
import { ManagePagination } from '@gmfe/business'
import { BoxTable, Price, ToolTip, Flex } from '@gmfe/react'
import { TableX, fixedColumnsTableXHOC, diyTableXHOC } from '@gmfe/table-x'
import TableTotalText from 'common/components/table_total_text'
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
      Header: t('出库规格ID'),
      diyEnable: false,
      accessor: 'sku_id',
      diyGroupName: t('基础字段'),
      minWidth: 100,
    },
    {
      Header: t('出库规格名'),
      diyEnable: false,
      accessor: 'sku_name',
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: t('商品分类'),
      accessor: 'category2_name',
      minWidth: 120,
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('计划编号'),
      accessor: 'proc_order_custom_id',
      diyEnable: false,
      minWidth: 160,
      diyGroupName: t('基础字段'),
    },
    {
      Header: t('出库数'),
      accessor: 'real_amount',
      diyEnable: false,
      minWidth: 100,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { real_amount, unit_name },
        },
      }) => `${parseFloat(Big(real_amount || 0).toFixed(2))}${unit_name}`,
    },
    {
      Header: (
        <Flex alignCenter>
          {t('出库均价')}
          <ToolTip
            top
            popup={
              <div className='gm-padding-5'>
                {t('出库均价=出库金额/出库数')}
              </div>
            }
          />
        </Flex>
      ),
      accessor: 'avg_price',
      diyEnable: false,
      minWidth: 100,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { avg_price, unit_name },
        },
      }) =>
        `${parseFloat(
          Big(avg_price || 0).toFixed(2),
        )}${Price.getUnit()}/${unit_name}`,
    },
    {
      Header: t('出库金额'),
      accessor: 'money',
      diyEnable: false,
      minWidth: 100,
      diyGroupName: t('基础字段'),
      Cell: ({
        row: {
          original: { money },
        },
      }) => `${parseFloat(Big(money).toFixed(2))}${Price.getUnit()}`,
    },
    {
      Header: t('领料人'),
      accessor: 'recver',
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

    store.export({ export: 1, async: 1, q: text, ...rest })
  }

  handlePageChange = (pagination) => {
    const { fetchData, filter } = store
    const { text, ...rest } = filter
    return fetchData(
      Object.assign(pagination, rest, { q: text || '', count: 1 }),
    )
  }

  render() {
    const { list, loading, pagination } = store
    return (
      <>
        <Filter
          hasRecver
          dateSelectBox={t('领料日期')}
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
