import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { TableX } from '@gmfe/table-x'
import moment from 'moment'
import PropTypes from 'prop-types'

import store from './store'
import { getPrice } from '../util'

@observer
class TradeFlow extends React.Component {
  componentDidMount() {
    // 获取交易信息数据
    const { id } = this.props
    store.getTradeFlow(id)
  }

  render() {
    const { tradeList } = store

    return (
      <TableX
        data={tradeList.slice()}
        columns={[
          {
            Header: t('操作时间'),
            id: 'time',
            Cell: cellProps => (
              <div>
                {moment(cellProps.row.original.time).format('YYYY-MM-DD HH:mm')}
              </div>
            )
          },
          {
            Header: t('变动金额'),
            id: 'amount',
            Cell: cellProps => (
              <div>{getPrice(cellProps.row.original, 'amount')}</div>
            )
          },
          {
            Header: t('操作人'),
            accessor: 'operator'
          },
          {
            Header: t('流水凭证'),
            accessor: 'deal_code'
          }
        ]}
      />
    )
  }
}

TradeFlow.propTypes = {
  id: PropTypes.string
}

export default TradeFlow
