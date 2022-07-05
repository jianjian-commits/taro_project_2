import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { BoxTable } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import TableTotalText from 'common/components/table_total_text'
import { Table } from '@gmfe/table'
import { store } from './store'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { checkFilter } from './utils'
import moment from 'moment'
import ReturnGoodsFilter from '../return_goods_filter'
import { urlToParams } from 'common/util'

@observer
class GiveUpPickUp extends Component {
  static propTypes = {
    inventory: PropTypes.object,
  }

  state = { count: 0 }

  pagination = createRef()

  columns = [
    { Header: t('商品ID'), accessor: 'spu_id' },
    { Header: t('退货商品名'), accessor: 'spu_name' },
    { Header: t('商品分类'), accessor: 'category_name_2' },
    { Header: t('退货单号'), accessor: 'order_id' },
    {
      Header: t('应退数'),
      accessor: 'request_amount',
      Cell: ({ original: { std_unit }, value }) => (
        <span>
          {value} {std_unit}
        </span>
      ),
    },
    {
      Header: t('应退金额'),
      accessor: 'request_refund_money',
      Cell: ({ value }) => (
        <span>
          {/* todo 后端说单位写死 */}
          {value} {t('元')}
        </span>
      ),
    },
    {
      Header: t('放弃时间'),
      accessor: 'create_time',
      Cell: ({ value }) => moment(value).format('YYYY-MM-DD'),
    },
    { Header: t('操作人'), accessor: 'operator' },
  ]

  setFilter = ({ search_text, ...rest }) => {
    store.setFilter('q', search_text)
    for (const [key, value] of Object.entries(rest)) {
      store.setFilter(key, value)
    }
  }

  handleSearch = (filter) => {
    this.setFilter(filter)
    this.pagination.current.apiDoFirstRequest()
  }

  handleExport = ({ search_text, ...rest }) => {
    this.setFilter({ search_text, ...rest })
    const reqFilter = {
      q: search_text,
      ...rest,
    }

    const option = checkFilter(reqFilter)
    window.open(`/stock/abandon_goods/log/export?${urlToParams(option)}`)
  }

  handleRequest = (pagination) => {
    const { filter } = store
    const option = checkFilter({ ...filter, pagination })
    return store.fetchGiveUpList(option).then(({ pagination }) => {
      const { count } = pagination
      this.setState({ count })
      return { pagination }
    })
  }

  render() {
    const { loading, giveUpList } = store
    const { count } = this.state
    return (
      <>
        <ReturnGoodsFilter
          tag={t('放弃')}
          onSearch={this.handleSearch}
          onExport={this.handleExport}
        />
        <BoxTable
          info={
            <TableTotalText data={[{ label: t('商品总数'), content: count }]} />
          }
        >
          <ManagePaginationV2
            ref={this.pagination}
            onRequest={this.handleRequest}
            id='pagination_in_product_give_up_pick_up_list'
          >
            <Table
              data={toJS(giveUpList)}
              columns={this.columns}
              loading={loading}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default GiveUpPickUp
