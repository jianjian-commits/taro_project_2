import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Pagination, Price } from '@gmfe/react'
import Big from 'big.js'
import moment from 'moment'
import { connect } from 'react-redux'
import './reducer.js'
import './actions.js'
import actions from '../../../actions'
import PropTypes from 'prop-types'

import { Table } from '@gmfe/table'

const formatTime = (date) => moment(date).format('MM-DD HH:mm')

class OrderSheetModal extends React.Component {
  componentDidMount() {
    const { orderIds } = this.props
    // 司机订单列表,右侧modal弹出
    actions.distribute_driver_get_driver_order_list(orderIds)
  }

  handlePageChange = (pagination) => {
    const { orderIds } = this.props
    actions.distribute_driver_get_driver_order_list(orderIds, pagination)
  }

  componentWillUnmount() {
    actions.distribute_driver_clean_driver_order_list()
  }

  render() {
    const { driverOrderList, pagination } = this.props.driverOrder

    return (
      <div style={{ height: '100%', overflow: 'scroll' }}>
        <Table
          data={driverOrderList.slice()}
          columns={[
            {
              Header: i18next.t('订单号'),
              accessor: 'id',
            },
            {
              Header: i18next.t('线路'),
              accessor: 'route_name',
            },
            {
              Header: i18next.t('商户名'),
              accessor: 'customer_name',
            },
            {
              Header: i18next.t('地理标签'),
              accessor: 'area',
            },
            {
              Header: i18next.t('配送地址'),
              accessor: 'receive_address',
            },
            {
              Header: i18next.t('金额'),
              id: 'total_price',
              accessor: (original) =>
                Big(original.total_price).div(100).toFixed(2) +
                Price.getUnit(original.fee_type),
            },
            {
              Header: i18next.t('收货时间'),
              id: 'receive',
              accessor: (original) =>
                `${formatTime(original.receive_begin_time)} - ${formatTime(
                  original.receive_end_time
                )}`,
            },
          ]}
        />
        <Flex justifyEnd className='gm-padding-20'>
          <Pagination data={pagination} toPage={this.handlePageChange} />
        </Flex>
      </div>
    )
  }
}

OrderSheetModal.propTypes = {
  driverOrder: PropTypes.object,
  orderIds: PropTypes.array,
}

export default connect((state) => ({
  driverOrder: state.distributeDriver.driverOrder,
}))(OrderSheetModal)
