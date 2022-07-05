import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import { isNoAvailReceiveTime } from '../../util'
import orderDetailStore from '../../store'
import RemarkInput from '../../components/remark_input'

const OrderComment = observer((props) => {
  const { repair } = props
  const { orderDetail } = orderDetailStore
  const { viewType, time_config_info, date_time } = orderDetail

  const handleCommentChange = (e) => {
    const newRemark = e.target.value
    orderDetailStore.receiveChange({ remark: newRemark })
  }

  const handleLastRemarkSelect = (last_remark) => {
    orderDetailStore.selectLastRemark(last_remark)
  }

  if (viewType === 'view') {
    return (
      <Popover
        showArrow
        type='hover'
        popup={
          <div
            className='gm-bg gm-padding-10'
            style={{ width: '400px', wordBreak: 'break-all' }}
          >
            {orderDetail.remark || '-'}
          </div>
        }
      >
        <Flex
          flex
          alignCenter
          className='b-ellipsis-order-remark'
          style={{ wordBreak: 'break-all' }}
        >
          {orderDetail.remark || '-'}
        </Flex>
      </Popover>
    )
  }

  const disabled =
    !time_config_info ||
    (!repair && isNoAvailReceiveTime(time_config_info, date_time))

  return (
    <Flex flex alignCenter>
      <RemarkInput
        spu_remark={disabled ? '' : orderDetail.last_remark}
        onSelect={handleLastRemarkSelect}
      >
        <input
          type='text'
          value={orderDetail.remark || ''}
          placeholder={i18next.t('输入商家对订单的特殊要求（128个字以内）')}
          maxLength={128}
          className='b-order-remark form-control input-sm'
          onChange={handleCommentChange}
          disabled={disabled}
          style={{ width: '350px' }}
        />
      </RemarkInput>
    </Flex>
  )
})

OrderComment.displayName = 'OrderComment'

OrderComment.propTypes = {
  orderDetail: PropTypes.object,
  repair: PropTypes.bool,
}

export default OrderComment
