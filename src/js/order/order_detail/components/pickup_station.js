import { Flex, Select } from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import orderDetailStore from '../../store'
import { isNoAvailReceiveTime } from '../../util'

const getPickupName = (id) => {
  const { pickUpList } = orderDetailStore
  return _.find(pickUpList, (item) => {
    return id === item.value
  })?.text
}

const OrderTypeSelect = observer((props) => {
  const { repair, onChange } = props
  const {
    orderDetail,
    pickUpList,
    getPickUpList,
    firstPickUp,
  } = orderDetailStore
  const { viewType, time_config_info, date_time, pick_up_st_id } = orderDetail
  getPickUpList()
  const isView = viewType === 'view'

  const isInitOnChangeRef = useRef(false)
  useEffect(() => {
    /**
     * 编辑情况下（!isView），已经请求了列表（pickUpList.isRequest），
     * 还没触发初始onChange（!isInitOnChangeRef.current），
     * 且用户已经创建了自提点（pickUpList不为空），
     * 且pick_up_st_id为0的情况下，自提点为列表第一个
     */
    if (
      !isView &&
      pickUpList.isRequest &&
      pickUpList.length &&
      !isInitOnChangeRef.current &&
      !pick_up_st_id
    ) {
      isInitOnChangeRef.current = true
      onChange(firstPickUp.value)
    }
  }, [isView, firstPickUp, pickUpList, onChange, pick_up_st_id])

  if (isView) {
    return (
      <Flex
        flex
        alignCenter
        className='b-ellipsis-order-remark'
        style={{ wordBreak: 'break-all' }}
      >
        {getPickupName(pick_up_st_id) || '-'}
      </Flex>
    )
  }

  const disabled =
    !time_config_info ||
    (!repair && isNoAvailReceiveTime(time_config_info, date_time))
  return (
    <Select
      className='b-order-select'
      data={pickUpList}
      disabled={disabled}
      value={pick_up_st_id}
      onChange={onChange}
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
