import React from 'react'
import { BoxTable } from '@gmfe/react'
import { Table } from '@gmfe/table'
import { t } from 'gm-i18n'
import { ManagePaginationV2 } from '@gmfe/business'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'

import store from '../store'
import TableTotalText from 'common/components/table_total_text'

@observer
class List extends React.Component {
  constructor(props) {
    super(props)

    this.refPagination = React.createRef(null)
  }

  componentDidMount() {
    store.setDoFirstRequest(this.refPagination.current.apiDoFirstRequest)
    this.refPagination.current.apiDoFirstRequest()
  }

  componentWillUnmount() {
    store.clearInfo()
  }

  handleChangePage(page) {
    return store.getList(page)
  }

  render() {
    const { sum, list } = store

    return (
      <BoxTable
        info={
          <TableTotalText
            data={[{ label: t('总金额'), content: Big(sum || 0).toFixed(2) }]}
          />
        }
      >
        <ManagePaginationV2
          id='pagination_member_card_member_info_charge_list'
          onRequest={this.handleChangePage}
          ref={this.refPagination}
        >
          <Table
            data={list.slice()}
            columns={[
              {
                Header: t('序号'),
                id: 'index',
                Cell: ({ index }) => index + 1
              },
              {
                Header: t('客户名'),
                id: 'nickname',
                accessor: 'nickname'
              },
              {
                Header: t('手机号'),
                id: 'telephone_number',
                accessor: 'telephone_number'
              },
              {
                Header: t('购买时间'),
                id: 'modify_time',
                accessor: item =>
                  moment(item.modify_time).format('YYYY-MM-DD HH:mm:ss')
              },
              {
                Header: t('购买卡种'),
                id: 'card_type',
                accessor: 'card_type'
              },
              {
                Header: t('购买天数'),
                id: 'card_days',
                accessor: 'card_days'
              },
              {
                Header: t('付款金额'),
                id: 'amount',
                accessor: item => {
                  const amount = _.toNumber(item.amount)
                  const val = _.isNumber(amount) ? Big(amount).toFixed(2) : null
                  return val
                }
              }
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default List
