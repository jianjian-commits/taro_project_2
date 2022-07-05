import React from 'react'
import { Flex } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'

import ReceiveTimeRepair from './repair_receive_time'
import ReceiveTime from '../../components/receive_time'
import { isOrderDistributing } from '../util'
import orderDetailStore from '../../store'

const ReceiveTimeAll = observer((props) => {
  const { repair } = props
  const { orderDetail } = orderDetailStore
  const { viewType, customer, time_config_info } = orderDetail

  if (
    viewType === 'view' ||
    isOrderDistributing(orderDetail) ||
    (time_config_info &&
      (time_config_info.type === 0 /* 默认运营时间 */ ||
        time_config_info.pstatus === 1)) /* 运营时间被删除了 */
  ) {
    return (
      <Flex alignCenter className='gm-padding-5 gm-padding-left-0'>
        <Flex flex alignCenter>
          {customer
            ? `${customer.receive_begin_time}~${customer.receive_end_time}`
            : '-'}
        </Flex>
      </Flex>
    )
  }

  if (time_config_info && repair) {
    // 补录订单
    return (
      <Observer>
        {() => {
          const {
            time_config_info,
            dateEnd,
            dateStart,
            timeStart,
            timeEnd,
          } = orderDetail
          return (
            <Flex column>
              <ReceiveTimeRepair
                order={{
                  time_config_info,
                  dateEnd,
                  dateStart,
                  timeStart,
                  timeEnd,
                }}
              />
            </Flex>
          )
        }}
      </Observer>
    )
  } else {
    // 正常下单
    return (
      <Observer>
        {() => {
          const {
            time_config_info,
            date_time,
            flagStart,
            flagEnd,
            timeStart,
            timeEnd,
            viewType,
            currentTime,
          } = orderDetail
          return (
            <Flex
              column
              alignCenter
              className='b-order-add-servicetime-box b-order-detail-header-receive'
            >
              <ReceiveTime
                order={{
                  time_config_info,
                  date_time,
                  flagStart,
                  flagEnd,
                  timeStart,
                  timeEnd,
                  viewType,
                  currentTime,
                }}
                onReceiveTimeChange={(changed) => {
                  orderDetailStore.receiveChange(changed)
                }}
              />
            </Flex>
          )
        }}
      </Observer>
    )
  }
})

ReceiveTimeAll.displayName = 'ReceiveTimeAll'

ReceiveTimeAll.propTypes = {
  repair: PropTypes.bool,
}

export default ReceiveTimeAll
