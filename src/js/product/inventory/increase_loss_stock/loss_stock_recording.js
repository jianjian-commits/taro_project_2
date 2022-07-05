import { i18next } from 'gm-i18n'
import React from 'react'
import { Pagination, Price, Flex } from '@gmfe/react'
import SearchFilter from '../return_goods_filter'
import moment from 'moment'
import Big from 'big.js'
import '../actions'
import '../reducer'
import actions from '../../../actions'
import { urlToParams } from '../../../common/util'
import { checkFilter } from '../../util'
import { Table } from '@gmfe/table'

class LossStockRecording extends React.Component {
  columns = [
    { Header: i18next.t('商品ID'), accessor: 'spu_id' },
    { Header: i18next.t('商品名'), accessor: 'name' },
    { Header: i18next.t('商品分类'), accessor: 'category_name_2' },
    {
      Header: i18next.t('报损数'),
      accessor: 'loss_amount',
      Cell: ({ original: { loss_amount, std_unit_name } }) =>
        `${parseFloat(Big(loss_amount || 0).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: i18next.t('报损单价'),
      accessor: 'price',
      Cell: ({ original: { price, std_unit_name } }) =>
        `${parseFloat(
          Big(price || 0)
            .div(100)
            .toFixed(2)
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: i18next.t('报损金额'),
      accessor: 'money',
      Cell: ({ original: { price, loss_amount } }) =>
        `${parseFloat(
          Big(price || 0)
            .div(100)
            .times(loss_amount || 0)
            .toFixed(2)
        )}${Price.getUnit()}`,
    },
    {
      Header: i18next.t('抄盘数'),
      accessor: 'old_stock',
      Cell: ({ original: { old_stock, std_unit_name } }) =>
        `${parseFloat(Big(old_stock || 0).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: i18next.t('实盘数'),
      accessor: 'r',
      Cell: ({ original: { old_stock, loss_amount, std_unit_name } }) =>
        `${parseFloat(
          Big(old_stock || 0)
            .minus(loss_amount || 0)
            .toFixed(2)
        )}${std_unit_name}`,
    },
    {
      Header: i18next.t('报损时间'),
      accessor: 'create_time',
      Cell: ({ original: { create_time } }) =>
        moment(create_time).format('YYYY-MM-DD'),
    },
    { Header: i18next.t('操作人'), accessor: 'operator' },
    { Header: i18next.t('备注'), accessor: 'remark' },
  ]

  constructor(props) {
    super(props)
    this.state = {
      pagination: {
        offset: 0,
        limit: 10,
      },
      filter: {},
    }

    this.toPageChange = ::this.toPageChange
  }

  handleSearch = (filter) => {
    const { begin, end, category1, category2, search_text } = filter
    const req = Object.assign(
      {},
      { begin, end },
      { offset: 0, limit: 10 },
      checkFilter(category1, category2, search_text)
    )
    actions.product_inventory_loss_stock_list(req).then(() => {
      this.setState({
        filter,
        pagination: {
          offset: 0,
          limit: 10,
        },
      })
    })
  }

  handleExport = (filter) => {
    const { begin, end, category1, category2, search_text } = filter
    const req = Object.assign(
      {},
      { begin, end },
      checkFilter(category1, category2, search_text)
    )
    window.open(`/stock/loss?export=1&${urlToParams(req)}`)
  }

  toPageChange(page) {
    const { begin, end, category1, category2, search_text } = this.state.filter
    const req = Object.assign(
      {},
      { begin, end },
      page,
      checkFilter(category1, category2, search_text)
    )
    actions.product_inventory_loss_stock_list(req).then(() => {
      this.setState({ pagination: page })
    })
  }

  render() {
    const { inventoryLossStockList } = this.props.inventory
    const { list, loading } = inventoryLossStockList
    const { pagination } = this.state

    return (
      <div>
        <SearchFilter
          tag={i18next.t('报损')}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <Table data={list} columns={this.columns} loading={loading} />
        <Flex alignCenter justifyEnd className='gm-padding-20'>
          <Pagination
            data={pagination}
            toPage={this.toPageChange}
            nextDisabled={list.length < 10}
          />
        </Flex>
      </div>
    )
  }
}

export default LossStockRecording
