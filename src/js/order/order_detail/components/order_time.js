import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import RepairOrderTime from './repair_order_time'
import orderDetailStore from '../../store'

const OrderTime = observer((props) => {
  const { repair } = props
  const { orderDetail } = orderDetailStore
  if (repair) {
    return <RepairOrderTime />
  }
  return orderDetail.date_time
    ? moment(orderDetail.date_time).format('YYYY-MM-DD HH:mm:ss')
    : '-'
})

OrderTime.displayName = 'OrderTime'

OrderTime.propTypes = {
  orderDetail: PropTypes.object,
  repair: PropTypes.bool,
}

export default OrderTime
