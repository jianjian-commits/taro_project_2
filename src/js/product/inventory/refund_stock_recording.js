import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Price, BoxTable } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import Big from 'big.js'

import './actions'
import './reducer'
import actions from '../../actions'
import { urlToParams } from '../../common/util'
import { checkFilter } from '../util'
import { Table } from '@gmfe/table'
import TableTotalText from 'common/components/table_total_text'
import moment from 'moment'
import InventoryCommonFilter from './inventory_common_filter'

class RefundStockRecording extends React.Component {
  columns = [
    { Header: t('商品ID'), accessor: 'spu_id' },
    { Header: t('退货规格ID'), accessor: 'sku_id' },
    { Header: t('退货规格名'), accessor: 'name' },
    {
      Header: t('规格'),
      accessor: 'specification',
      Cell: (cellProps) => {
        const {
          std_unit_name,
          purchase_unit_name,
          purchase_ratio,
        } = cellProps.original
        return purchase_ratio + std_unit_name + '/' + purchase_unit_name
      },
    },
    { Header: t('商品分类'), accessor: 'category_name_2' },
    {
      Header: t('退货单号'),
      accessor: 'sheet_no',
      width: 230,
      Cell: ({ original: { sheet_no } }) => (
        <a
          href={`#/sales_invoicing/stock_out/refund/detail/${sheet_no}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {sheet_no}
        </a>
      ),
    },
    {
      Header: t('退货数'),
      accessor: 'return_amount',
      Cell: ({ original: { return_amount, std_unit_name } }) =>
        `${parseFloat(Big(return_amount || 0).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: t('退货单价'),
      accessor: 'price',
      Cell: ({ original: { price, std_unit_name } }) =>
        `${parseFloat(
          Big(price || 0)
            .div(100)
            .toFixed(2)
        )}${Price.getUnit()}${std_unit_name}`,
    },
    {
      Header: t('退货金额'),
      accessor: 'all_price',
      Cell: ({ original: { all_price } }) =>
        `${parseFloat(Big(all_price).div(100).toFixed(2))}${Price.getUnit()}`,
    },
    {
      Header: () => {
        const {
          filter: { timeType },
        } = this.state
        return timeType === 2 ? t('退货出库时间') : t('提交时间')
      },
      Cell: ({ original: { submit_time, commit_time } }) => {
        const {
          filter: { timeType },
        } = this.state
        return timeType === 2 ? submit_time : commit_time
      },
    },
    { Header: t('操作人'), accessor: 'operator' },
  ]

  constructor(props) {
    super(props)

    this.refundStockRecordingRef = React.createRef()
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
  }

  componentDidMount() {
    this.refundStockRecordingRef.current.apiDoFirstRequest()
  }

  handleSearch = (filter) => {
    this.setState(
      {
        filter,
      },
      () => {
        this.refundStockRecordingRef.current.apiDoFirstRequest()
      }
    )
  }

  handleExport = (filter) => {
    const req = this.getReqData(filter)
    window.open(`/stock/return_supply_sku?export=1&${urlToParams(req)}`)
  }

  getReqData = (filter, page) => {
    const { begin, end, level1, level2, text, timeType } = filter
    return Object.assign(
      {},
      { begin, end, time_type: timeType },
      page,
      checkFilter(level1, level2, text)
    )
  }

  handlePageChange = (page) => {
    const req = this.getReqData(this.state.filter, page)

    return actions.product_inventory_refund_stock_list(req).then((json) => {
      this.setState({ pagination: json.pagination })
      return json
    })
  }

  render() {
    const { inventoryRefundStockList } = this.props.inventory
    const { list, loading } = inventoryRefundStockList
    const { pagination } = this.state

    return (
      <div>
        <InventoryCommonFilter
          tag={[
            { text: t('提交时间'), value: 1 },
            { text: t('退货出库时间'), value: 2 },
          ]}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          id='refund_stock_recording_managepagination'
          ref={this.refundStockRecordingRef}
          onRequest={this.handlePageChange}
        >
          <BoxTable
            info={
              <TableTotalText
                data={[
                  {
                    label: t('商品总数'),
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
    )
  }
}

RefundStockRecording.propTypes = {
  inventory: PropTypes.object,
}

export default RefundStockRecording
