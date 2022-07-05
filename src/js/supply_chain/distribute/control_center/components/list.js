import React from 'react'
import { observer, inject } from 'mobx-react'
import { Table } from '@gmfe/table'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import moment from 'moment'

const dateFormat = (t) => moment(t).format('YYYY-MM-DD')
const DATE_TYPE = {
  '1': t('下单日期'),
  '2': t('运营时间'),
  '3': t('收货日期'),
}

@inject('store')
@observer
class List extends React.Component {
  static propTypes = {
    store: PropTypes.object,
  }

  render() {
    const {
      list,
      isLoading,
      filter: { date_type },
    } = this.props.store

    return (
      <Table
        data={list.slice()}
        loading={isLoading}
        columns={[
          {
            Header: DATE_TYPE[date_type],
            accessor: (d) => dateFormat(d.distribute_time),
            id: 'distribute_time',
          },
          { Header: t('承运商'), accessor: 'carrier_name' },
          { Header: t('司机名称'), accessor: 'driver_name' },
          {
            Header: t('已签收订单'),
            accessor: (d) =>
              d.received_orders
                .map((d) => `${d.order_id}[${d.address_name}]`)
                .join('，'),
            id: 'received_orders',
          },
          {
            Header: t('配送中订单'),
            accessor: (d) =>
              d.distributing_orders
                .map((d) => `${d.order_id}[${d.address_name}]`)
                .join('，'),
            id: 'distributing_orders',
          },
          { Header: t('最后记录位置'), accessor: 'last_location' },
          { Header: t('结束时间'), accessor: 'distribute_end_time' },
          { Header: t('配送用时'), accessor: 'distribute_cost_time' },
          { Header: t('滞留时间'), accessor: 'stop_time' },
        ]}
      />
    )
  }
}

export default List
