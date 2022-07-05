import React from 'react'
import { Select, Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import { isNoAvailReceiveTime } from '../../util'
import orderDetailStore from '../../store'
import { RECEIVE_WAYS } from '../../../common/enum'
import { findReceiveWayById } from '../../../common/filter'
const OrderTypeSelect = observer((props) => {
  const { repair } = props
  const { orderDetail } = orderDetailStore
  const { viewType, time_config_info, date_time, receive_way } = orderDetail

  if (viewType === 'view') {
    return (
      <Flex
        flex
        alignCenter
        className='b-ellipsis-order-remark'
        style={{ wordBreak: 'break-all' }}
      >
        {findReceiveWayById(receive_way) || '-'}
      </Flex>
    )
  }

  const disabled =
    !time_config_info ||
    (!repair && isNoAvailReceiveTime(time_config_info, date_time))

  let selectOrderType = receive_way

  const list = RECEIVE_WAYS.map((way) => {
    way.text = way.name
    return way
  })

  if (disabled) {
    selectOrderType = '0'
    list.splice(0, 0, { value: '0', text: '请选择收货方式' })
  }

  return (
    <Select
      className='b-order-select'
      data={list}
      disabled={disabled}
      value={selectOrderType}
      onChange={(value) =>
        orderDetailStore.receiveChange({ receive_way: value })
      }
      style={{ width: '165px' }}
    />
  )
})

OrderTypeSelect.propTypes = {
  orderDetail: PropTypes.object,
  repair: PropTypes.bool,
  isDistributedOrder: PropTypes.bool,
}

export default OrderTypeSelect
