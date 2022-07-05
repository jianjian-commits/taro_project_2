import React, { Component, createRef } from 'react'
import Filter from '../../../components/filter'
import { i18next, t } from 'gm-i18n'
import { ManagePagination } from '@gmfe/business'
import { TableX, fixedColumnsTableXHOC, diyTableXHOC } from '@gmfe/table-x'
import Big from 'big.js'
import { Price } from '@gmfe/react'
import moment from 'moment'
import { observer } from 'mobx-react'
import { store } from './store'

const FixedColumnsDiyTableX = fixedColumnsTableXHOC(diyTableXHOC(TableX))

@observer
class FinishedLoss extends Component {
  paginationRef = createRef()

  columns = [
    {
      Header: i18next.t('商品ID'),
      diyEnable: false,
      accessor: 'spu_id',
      diyGroupName: t('基础字段'),
      minWidth: 120,
      fixed: 'left',
    },
    {
      Header: i18next.t('商品名'),
      accessor: 'name',
      diyEnable: false,
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
      Header: i18next.t('报损数'),
      diyEnable: false,
      accessor: 'loss_amount',
      Cell: ({
        row: {
          original: { loss_amount, std_unit_name },
        },
      }) => `${parseFloat(Big(loss_amount || 0).toFixed(2))}${std_unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: i18next.t('报损单价'),
      accessor: 'price',
      diyEnable: false,
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
      minWidth: 120,
    },
    {
      Header: i18next.t('报损金额'),
      accessor: 'money',
      diyEnable: false,
      Cell: ({
        row: {
          original: { price, loss_amount },
        },
      }) =>
        `${parseFloat(
          Big(price || 0)
            .div(100)
            .times(loss_amount || 0)
            .toFixed(2),
        )}${Price.getUnit()}`,
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: i18next.t('抄盘数'),
      accessor: 'old_stock',
      diyEnable: false,
      Cell: ({
        row: {
          original: { old_stock, std_unit_name },
        },
      }) => `${parseFloat(Big(old_stock || 0).toFixed(2))}${std_unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: i18next.t('实盘数'),
      accessor: 'r',
      diyEnable: false,
      Cell: ({
        row: {
          original: { old_stock, loss_amount, std_unit_name },
        },
      }) =>
        `${parseFloat(
          Big(old_stock || 0)
            .minus(loss_amount || 0)
            .toFixed(2),
        )}${std_unit_name}`,
      diyGroupName: t('基础字段'),
      minWidth: 120,
    },
    {
      Header: i18next.t('报损时间'),
      accessor: 'create_time',
      Cell: ({
        row: {
          original: { create_time },
        },
      }) => moment(create_time).format('YYYY-MM-DD'),
      diyGroupName: t('基础字段'),
      minWidth: 120,
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
    store.export({ export: 1, async: 1, ...filter })
  }

  handlePageChange = (pagination) => {
    const { filter, fetchData } = store
    return fetchData(Object.assign(filter, pagination))
  }

  render() {
    const { list, loading } = store
    return (
      <>
        <Filter
          dateSelectBox={t('报损时间')}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          id='increase'
          onRequest={this.handlePageChange}
          ref={this.paginationRef}
        >
          <FixedColumnsDiyTableX
            id='loss'
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

export default FinishedLoss
