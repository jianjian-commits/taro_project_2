import { t } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Price, BoxTable } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import Big from 'big.js'

import './actions'
import './reducer'
import '../actions'
import '../reducer'
import actions from '../../actions'
import { urlToParams } from '../../common/util'
import { checkFilter } from '../util'
import { Table } from '@gmfe/table'
import TableTotalText from 'common/components/table_total_text'
import InventoryCommonFilter from './inventory_common_filter'
import moment from 'moment'

class InStockRecording extends React.Component {
  columns = [
    { Header: t('商品ID'), accessor: 'spu_id' },
    { Header: t('入库规格ID'), accessor: 'sku_id' },
    { Header: t('入库规格名'), accessor: 'name' },
    {
      Header: t('规格'),
      accessor: 'specification',
      Cell: (cellProps) => {
        const {
          std_unit_name,
          purchase_unit,
          purchase_ratio,
        } = cellProps.original
        return purchase_ratio + std_unit_name + '/' + purchase_unit
      },
    },
    { Header: t('商品分类'), accessor: 'category_name_2' },
    {
      Header: t('入库单号'),
      accessor: 'sheet_no',
      width: 220,
      Cell: ({ original: { sheet_no } }) => (
        <a
          href={`#/sales_invoicing/stock_in/product/detail?id=${sheet_no}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {sheet_no}
        </a>
      ),
    },
    {
      Header: t('供应商'),
      accessor: 'supplier_name',
    },
    {
      Header: t('入库数'),
      accessor: 'in_stock_amount',
      Cell: ({ original: { in_stock_amount, std_unit_name } }) =>
        `${parseFloat(Big(in_stock_amount || 0).toFixed(2))}${std_unit_name}`,
    },
    {
      Header: t('入库单价'),
      accessor: 'price',
      Cell: ({ original: { price, std_unit_name } }) =>
        `${parseFloat(
          Big(price || 0)
            .div(100)
            .toFixed(2)
        )}${Price.getUnit()}/${std_unit_name}`,
    },
    {
      Header: t('入库金额'),
      accessor: 'all_price',
      Cell: ({ original: { all_price } }) =>
        `${parseFloat(Big(all_price).div(100).toFixed(2))}${Price.getUnit()}`,
    },
    {
      Header: () => {
        const {
          filter: { timeType },
        } = this.state
        return timeType === 2 ? t('入库时间') : t('提交时间')
      },
      Cell: ({ original: { submit_time, commit_time } }) => {
        const {
          filter: { timeType },
        } = this.state
        return timeType === 2 ? submit_time : commit_time
      },
    },
    { Header: t('操作人'), accessor: 'operator' },
    { Header: t('商品备注'), accessor: 'remark' },
  ]

  constructor(props) {
    super(props)
    this.inStockRecordingRef = React.createRef()
    const now = new Date()
    this.state = {
      filter: {
        begin: moment(now).format('YYYY-MM-DD'),
        end: moment(now).format('YYYY-MM-DD'),
      },
      pagination: {},
    }
  }

  componentDidMount() {
    // 拉取供应商
    actions.product_suppliers()
    // 获取列表数据
    this.inStockRecordingRef.current.apiDoFirstRequest()
  }

  handleSearch = (filter) => {
    this.setState(
      {
        filter,
      },
      () => {
        this.inStockRecordingRef.current.apiDoFirstRequest()
      }
    )
  }

  handleExport = (filter) => {
    const req = this.getReqData(filter)
    window.open(`/stock/in_stock_sku?export=1&${urlToParams(req)}`)
  }

  getReqData = (filter, page) => {
    const { begin, end, level1, level2, text, supplier, timeType } = filter

    return Object.assign(
      {},
      { begin, end, time_type: timeType },
      page,
      checkFilter(level1, level2, text, supplier)
    )
  }

  handlePageChange = (page) => {
    const req = this.getReqData(this.state.filter, page)
    return actions.product_inventory_in_stock_list(req).then((json) => {
      this.setState({ pagination: json.pagination })
      return json
    })
  }

  render() {
    const { inventoryInStockList } = this.props.inventory
    const { list, loading } = inventoryInStockList
    const { pagination } = this.state
    return (
      <div>
        <InventoryCommonFilter
          tag={[
            { value: 1, text: t('提交时间') },
            { value: 2, text: t('入库时间') },
          ]}
          hasSupplier
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <ManagePagination
          id='in_stock_recording_managepagination'
          ref={this.inStockRecordingRef}
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

InStockRecording.propTypes = {
  inventory: PropTypes.object,
  product: PropTypes.object,
}

export default InStockRecording
