import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover } from '@gmfe/react'
import moment from 'moment'
import _ from 'lodash'

import { ORDER_CLIENTS } from '../../../common/enum'
import { findReceiveWayById } from '../../../common/filter'

const backgroundCollection = (viewType, isDistributedOrder) => {
  let bu = null
  if (isDistributedOrder && viewType === 'edit') {
  } else {
    bu = (
      <i
        className='ifont ifont-bu gm-margin-left-10'
        style={{
          color: '#CE3D2E',
          fontSize: '20px',
          verticalAlign: 'middle',
        }}
      />
    )
  }
  return (
    <div>
      <span style={{ verticalAlign: 'middle' }}>{i18next.t('后台补录')}</span>
      {bu}
    </div>
  )
}

export const receiver = (customer) => {
  return customer
    ? `${customer.receiver_name}（${customer.receiver_phone}）`
    : '-'
}

export const client = (params) => {
  const { repair, viewType, client_desc, isDistributedOrder, client } = params
  if (client) {
    const item = _.find(ORDER_CLIENTS, (order) => order.value === client)
    if (item.value === 7) {
      return backgroundCollection(viewType, isDistributedOrder)
    } else {
      return item.name
    }
  }

  if (repair && viewType === 'create') {
    return backgroundCollection(viewType, isDistributedOrder)
  }
  if (!repair && viewType === 'create') return i18next.t('后台下单')
  return client_desc || '-'
}

export const address = (customer, receiveWay) => {
  return (
    <div>
      {customer ? (
        <span
          className='label label-primary gm-text-12'
          style={{ padding: '1px 2px', marginRight: '2px' }}
        >
          {findReceiveWayById(customer.receive_way)}
        </span>
      ) : null}
      {customer ? customer.address : '-'}
    </div>
  )
}

export const addressEditable = (pickUpList, orderDetail, handleChange) => {
  const { customer, receive_way, viewType, pick_up_st_id } = orderDetail

  if (viewType === 'view') {
    return (
      <Popover
        showArrow
        type='hover'
        popup={
          <div
            className='gm-bg gm-padding-10'
            style={{ maxWidth: '244px', wordBreak: 'break-all',lineHeight:"20px" }}
          >
            {customer ? customer.address : '-'}
          </div>
        }
      >
        <div style={{
          "overflow": 'hidden',
          'text-overflow': 'ellipsis',
          'display': '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical'
        }}>
          {customer ? (
            <span
              className='label label-primary gm-text-12'
              style={{ padding: '1px 2px', marginRight: '2px' }}
            >
              {findReceiveWayById(customer.receive_way)}
            </span>
          ) : null}
          {customer ? customer.address : '-'}
        </div>
      </Popover>

    )
  }
  // 配送，使用默认地址，地址可以修改
  if (receive_way === 1) {
    return (
      <input
        type='text'
        value={customer?.address || ''}
        placeholder={i18next.t('输入收货地址')}
        className='b-order-remark form-control input-sm'
        onChange={handleChange}
        style={{ width: '350px' }}
      />
    )
  }
  // 自提，需要选择自提点，自提点地址不可修改
  else if (receive_way === 2) {
    if (!customer?.pickAddress) {
      const pickObj = _.find(pickUpList, (item) => {
        return pick_up_st_id === item.value
      })
      if (pickObj && customer) {
        customer.pick_up_st_id = pickObj.value
        customer.pickAddress = pickObj.address
      }
    }
    return <div>{customer?.pickAddress || '-'}</div>
  } else {
    return '-'
  }
}

export const last_operation = (orderDetail) => {
  return (
    <div>
      {orderDetail.last_op_user || '-'}
      {orderDetail.last_op_time
        ? `（${moment(orderDetail.last_op_time).format(
          'YYYY-MM-DD HH:mm:ss',
        )}）`
        : '-'}
    </div>
  )
}
