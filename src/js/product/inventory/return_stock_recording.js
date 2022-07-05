import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Price, BoxTable } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import moment from 'moment'
import Big from 'big.js'

import './actions'
import './reducer'
import actions from '../../actions'
import { urlToParams } from '../../common/util'
import { checkFilter } from '../util'
import { Table } from '@gmfe/table'
import ReturnGoodsFilter from './return_goods_filter'
import TableTotalText from 'common/components/table_total_text'

class ReturnStockRecording extends React.Component {
  columns = [
    { Header: i18next.t('商品ID'), accessor: 'spu_id' },
    { Header: i18next.t('退货商品名'), accessor: 'name' },
    { Header: i18next.t('商品分类'), accessor: 'category_name_2' },
    { Header: i18next.t('退货单号'), accessor: 'order_id' },
    {
      Header: i18next.t('入库数'),
      accessor: 'in_stock_amount',
      Cell: ({ original: { in_stock_amount, std_unit_name } }) =>
        `${parseFloat(Big(in_stock_amount || 0).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: i18next.t('入库单价'),
      accessor: 'price',
      Cell: ({ original: { price, std_unit_name } }) =>
        `${parseFloat(
          Big(price || 0)
            .div(100)
            .toFixed(2)
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: i18next.t('入库金额'),
      accessor: 'price',
      Cell: ({ original: { price, in_stock_amount } }) =>
        `${parseFloat(
          Big(price || 0)
            .times(in_stock_amount || 0)
            .div(100)
            .toFixed(2)
        )}${Price.getUnit()}`,
    },
    {
      Header: i18next.t('销售价'),
      accessor: 'std_sale_price',
      Cell: ({ original: { std_sale_price, std_unit_name } }) =>
        `${parseFloat(
          Big(std_sale_price).div(100).toFixed(2)
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: i18next.t('销售金额'),
      accessor: 'money',
      Cell: ({ original: { money, accept_std_count, std_sale_price } }) =>
        `${parseFloat(
          Big(std_sale_price || 0)
            .times(accept_std_count || 0)
            .div(100)
            .toFixed(2)
        )}${Price.getUnit()}`,
    },
    {
      Header: i18next.t('入库时间'),
      accessor: 'create_time',
      Cell: ({ original: { create_time } }) =>
        moment(create_time).format('YYYY-MM-DD'),
    },
    { Header: i18next.t('操作人'), accessor: 'operator' },
  ]

  constructor(props) {
    super(props)
    const now = new Date()

    this.state = {
      pagination: {
        offset: 0,
        limit: 10,
      },
      filter: {
        begin: moment(now).format('YYYY-MM-DD'),
        end: moment(now).format('YYYY-MM-DD'),
      },
    }

    this.returnStockRecordingRef = React.createRef()
  }

  componentDidMount() {
    this.returnStockRecordingRef.current.apiDoFirstRequest()
  }

  handleSearch = (filter) => {
    this.setState(
      {
        filter,
      },
      () => {
        this.returnStockRecordingRef.current.apiDoFirstRequest()
      }
    )
  }

  handleExport = (filter) => {
    const req = this.getReqData(filter)
    window.open(`/stock/refund_stock_sku?export=1&${urlToParams(req)}`)
  }

  getReqData = (filter, page) => {
    const { begin, end, category1, category2, search_text } = filter
    return Object.assign(
      {},
      { begin, end },
      page,
      checkFilter(category1, category2, search_text)
    )
  }

  handlePageChange = (page) => {
    const req = this.getReqData(this.state.filter, page)

    return actions.product_inventory_return_stock_list(req).then((json) => {
      this.setState({
        pagination: json.pagination,
      })
      return json
    })
  }

  render() {
    const { inventoryReturnStockList } = this.props.inventory
    const { list, loading } = inventoryReturnStockList
    const { pagination } = this.state

    return (
      <div>
        <ReturnGoodsFilter
          tag={i18next.t('退货入库')}
          labelWidth={90}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <div>
          <ManagePagination
            id='return_stock_recording_managepagination'
            ref={this.returnStockRecordingRef}
            onRequest={this.handlePageChange}
          >
            <BoxTable
              info={
                <TableTotalText
                  data={[
                    {
                      label: i18next.t('商品总数'),
                      content: pagination.count || 0,
                    },
                  ]}
                />
              }
            >
              <Table data={list} columns={this.columns} loading={loading} />
            </BoxTable>
          </ManagePagination>
        </div>
      </div>
    )
  }
}

ReturnStockRecording.propTypes = {
  inventory: PropTypes.object,
}

export default ReturnStockRecording
