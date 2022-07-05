import React from 'react'
import { Select, Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import { getOrderTypeList } from 'common/deal_order_process'
import { renderOrderTypeName } from 'common/deal_order_process'
import { client as orderClient } from './detail_header_two'
import { isNoAvailReceiveTime, isLK } from '../../util'
import { isOrderDistributing } from '../util'

import orderDetailStore from '../../store'
import globalStore from '../../../stores/global'

const OrderTypeSelect = observer((props) => {
  const { repair } = props
  const { orderDetail } = orderDetailStore
  const {
    viewType,
    orderType,
    client_desc,
    client,
    orderTypeName,
    time_config_info,
    date_time,
    _id,
    status,
  } = orderDetail

  // 订单保存确定类型之后无法再进行修改
  if (viewType !== 'create') {
    const isOldOrderEditable = globalStore.hasPermission(
      'edit_old_order_change'
    )
    const isDistributedOrder =
      isOldOrderEditable && isOrderDistributing({ status }) && !isLK(_id)
    const orderName = renderOrderTypeName(orderTypeName)
    return (
      <Flex row alignCenter>
        {`${orderName} ·`}&nbsp;
        {orderClient({
          repair,
          viewType,
          client_desc,
          isDistributedOrder,
          client,
        })}
      </Flex>
    )
  }

  const disabled =
    !time_config_info ||
    (!repair && isNoAvailReceiveTime(time_config_info, date_time))
  let selectOrderType = orderType
  const list = getOrderTypeList()

  if (disabled) {
    selectOrderType = '1'
    list.splice(0, 1, { value: '1', text: '请选择订单类型' })
  } else {
    list.splice(0, 1)
  }

  return (
    <Select
      className='b-order-select'
      data={list}
      disabled={disabled}
      value={selectOrderType}
      onChange={(value) => orderDetailStore.receiveChange({ orderType: value })}
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
