// 暂时应用于移动端，后续废弃
import React from 'react'
import { DatePicker, Flex, TimeSpanPicker, Button } from '@gmfe/react'
import moment from 'moment'
import orderDetailStore from './detail_store_old'

class RepairOrderTime extends React.Component {
  isOrderTimeCrossDay = () => {
    const { orderDetail } = this.props
    const { time_config_info } = orderDetail
    let isCross = 0
    if (time_config_info) {
      const { order_time_limit } = time_config_info
      const { e_span_time, s_span_time } = order_time_limit
      isCross = e_span_time - s_span_time
    }
    return isCross
  }

  handleChangeOrderDate = (date) => {
    const { orderDetail } = this.props
    const { time_config_info, order_date_time } = orderDetail
    const orderTime = moment(order_date_time).format('HH:mm')
    const { start } = time_config_info && time_config_info.order_time_limit
    const changeDate = moment(date).format('YYYY-MM-DD')
    const initialTime = orderTime === null ? start : orderTime
    const time = moment(initialTime, 'HH:mm').format('HH:mm:ss')
    const date_time = `${changeDate} ${time}`
    orderDetailStore.receiveChange({
      order_date_time: date_time,
    })
  }

  handleDisabledSpan = (spanItem) => {
    const isCross = this.isOrderTimeCrossDay()
    const { orderDetail } = this.props
    const { time_config_info } = orderDetail
    if (time_config_info) {
      const { order_time_limit } = time_config_info
      const { start, end } = order_time_limit
      if (isCross) {
        return (
          spanItem.isAfter(moment(end, 'HH:mm')) &&
          spanItem.isBefore(moment(start, 'HH:mm'))
        )
      }
    }
    return false
  }

  handleChangeOrderTime = (time) => {
    const {
      orderDetail: { order_date_time },
    } = this.props
    const date = moment(order_date_time).format('YYYY-MM-DD')
    const date_time = `${date} ${moment(time).format('HH:mm:ss')}`
    orderDetailStore.receiveChange({
      order_date_time: date_time,
    })
  }

  render() {
    const { orderDetail } = this.props
    const { order_date_time } = orderDetail
    const orderDate = moment(order_date_time).startOf('day')
    const orderTime = moment(order_date_time).format('HH:mm')
    const { time_config_info } = orderDetail
    const disabled = !time_config_info

    let start = '00:00'
    let end = moment(orderDate).isSame(moment(), 'day')
      ? moment().format('HH:mm')
      : '23:30'
    let time = orderTime || '00:00'
    if (time_config_info) {
      const { order_time_limit } = time_config_info
      const isCross = this.isOrderTimeCrossDay()
      time = !orderTime ? order_time_limit.start : time
      if (!isCross) {
        start = order_time_limit.start
        end = order_time_limit.end
      }
    }

    return (
      <Flex
        flex
        alignCenter
        className={time_config_info ? '' : 'b-order-add-servicetime-box'}
      >
        {time_config_info ? (
          <DatePicker
            max={moment()}
            date={orderDate}
            onChange={this.handleChangeOrderDate}
          />
        ) : (
          <select
            className='form-control input-sm b-order-create-receive-time'
            disabled
          />
        )}
        <TimeSpanPicker
          className='b-width-60 gm-margin-lr-5'
          date={moment(time, 'HH:mm')}
          min={moment(start, 'HH:mm')}
          max={moment(end, 'HH:mm')}
          disabledSpan={this.handleDisabledSpan}
          onChange={this.handleChangeOrderTime}
        >
          <Button
            className='gm-margin-lr-5'
            style={{ width: '60px' }}
            disabled={disabled}
          >
            {time}
          </Button>
        </TimeSpanPicker>
      </Flex>
    )
  }
}

export default RepairOrderTime
