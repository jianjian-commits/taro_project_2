import React from 'react'
import { Table } from '@gmfe/table'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import moment from 'moment'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { ManagePaginationV2 } from '@gmfe/business'
import styled from 'styled-components'

import store from '../store'

@observer
class BuyList extends React.Component {
  constructor(props) {
    super(props)
    this.refPagination = React.createRef(null)
  }

  componentDidMount() {
    store.setDoBuyFirstRequest(this.refPagination.current.apiDoFirstRequest)
    this.refPagination.current.apiDoFirstRequest()
  }

  componentWillUnmount() {
    store.clearBuyList()
  }

  handleBuyChangePage(page, id) {
    return store.getBuyList(id, page)
  }

  render() {
    const { id } = this.props
    const { buy_list } = store

    return (
      <ManagePaginationV2
        id='pagination_member_card_member_info_buy_list'
        onRequest={page => this.handleBuyChangePage(page, id)}
        ref={this.refPagination}
      >
        <Box>
          <Table
            data={buy_list.slice()}
            columns={[
              {
                Header: t('购买时间'),
                id: '1',
                width: 160,
                accessor: item =>
                  moment(item.create_time).format('YYYY-MM-DD HH:mm:ss')
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
                accessor: item => Big(item.amount).toFixed(2)
              }
            ]}
          />
        </Box>
      </ManagePaginationV2>
    )
  }
}

BuyList.propTypes = {
  id: PropTypes.number.isRequired
}

const Box = styled.div`
  overflow-y: auto;
  height: 200px;
`

export default BuyList
