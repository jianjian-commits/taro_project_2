import { Button, DatePicker, Flex, Select, TimeSpanPicker } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import moment from 'moment'
import React from 'react'
import globalStore from 'stores/global'
import orderDetailStore from '../../store'

/**
 * 补录订单日期时间的组件类
 */
@observer
class RepairOrderTime extends React.Component {
  orderMoment = moment()

  state = {
    orderMoment: this.orderMoment,
  }

  /**
   * 判断下单时间能否跨天
   * @return {boolean} 下单时间能否跨天；true为能跨天，否则不能
   */
  isOrderTimeCrossDay = () => {
    const { orderDetail } = orderDetailStore
    const { time_config_info } = orderDetail
    let isCross = 0
    if (time_config_info) {
      const { order_time_limit } = time_config_info
      const { e_span_time, s_span_time } = order_time_limit
      isCross = e_span_time - s_span_time
    }
    return isCross
  }

  /**
   * 处理更改下单日期事件，下单日期更改时触发
   * 更新下单日期和时间
   */
  handleChangeOrderDate = (orderDate) => {
    const date = moment(orderDate).format('YYYY-MM-DD')
    const time = this.orderMoment.format('HH:mm')
    const dateTime = `${date} ${time}`
    this.orderMoment = moment(dateTime)

    orderDetailStore.receiveChange({
      order_date_time: dateTime,
    })

    // 如果选择了历史报价，需要更新商品历史报价
    if (globalStore.orderSupplementPrice) {
      orderDetailStore.updateSkuPrice()
    }

    this.setState({
      orderMoment: this.orderMoment,
    })
  }

  /**
   * 判断当前时段是否禁用
   * @param  {moment}  spanItem 当前时段
   * @return {boolean}          是否禁用当前时段，true为禁用，否则不禁用
   */
  isSpanDisabled = (spanItem) => {
    // 若下单日期为当前日期，则禁用当前时间之后的所有时间
    if (
      this.orderMoment.isSame(moment(), 'day') &&
      spanItem.isAfter(moment())
    ) {
      return true
    }

    // 若没有time_config_info，则所有时间都被禁用
    const { orderDetail } = orderDetailStore
    const { time_config_info } = orderDetail
    if (!time_config_info) {
      return true
    }

    // 1. 若下单时间可跨天，则禁用(end, start)中的时间，注意是开区间
    //    此时一般结束时间会小于开始时间，如果相等或大于也没关系，就相当于全天都可选
    // 2. 若下单时间为同天，则禁用[start, end]外的时间，注意是闭区间
    //    此时一般开始时间会小于等于结束时间，如果大于也没关系，就相当于全天都不可选
    const { order_time_limit } = time_config_info
    const { start, end } = order_time_limit
    const isCross = this.isOrderTimeCrossDay()
    const isBeforeStart = spanItem.isBefore(moment(start, 'HH:mm'))
    const isAfterEnd = spanItem.isAfter(moment(end, 'HH:mm'))

    return isCross ? isBeforeStart && isAfterEnd : isBeforeStart || isAfterEnd
  }

  /**
   * 处理下单时间更改事件，下单时间更改时触发
   * 更新下单日期和时间
   * @param {string} 更改后的下单时间
   */
  handleChangeOrderTime = (orderTime) => {
    const date = this.orderMoment.format('YYYY-MM-DD')
    const time = moment(orderTime).format('HH:mm')
    const dateTime = `${date} ${time}`
    this.orderMoment = moment(dateTime)

    orderDetailStore.receiveChange({
      order_date_time: dateTime,
    })

    // 如果选择了历史报价，需要更新商品历史报价
    if (globalStore.orderSupplementPrice) {
      orderDetailStore.updateSkuPrice()
    }

    this.setState({
      orderMoment: this.orderMoment,
    })
  }

  /**
   * 获取下单时间限制信息，包括上下限和是否跨天
   * @return {Object} 下单时间限制信息
   */
  getOrderTimeLimit = (time_config_info) => {
    let orderTimeLimit = {
      start: '00:00',
      end: '23:30',
      isCross: false,
    }
    if (time_config_info) {
      const { order_time_limit } = time_config_info
      const { start, end } = order_time_limit
      const isCross = this.isOrderTimeCrossDay()
      orderTimeLimit = { start, end, isCross }
    }

    return orderTimeLimit
  }

  /**
   * 渲染组件
   * @override
   */
  render() {
    const { orderDetail } = orderDetailStore
    const {
      dateStart, // 收货开始日期，一般为开始日期 + 当前时间
      time_config_info,
    } = orderDetail
    const disabled = !time_config_info

    // 如果当前下单日期晚于收货开始日期，则下单日期改为收货开始日期，时间不变
    if (this.orderMoment.isAfter(moment(dateStart), 'day')) {
      const [year, month, date] = moment(dateStart)
        .format('YYYY-MM-DD')
        .split('-')
      this.orderMoment.set({ year, month: month - 1, date })
    }

    // 获取下单限制时间信息，包括上下限以及是否跨天
    const { start } = this.getOrderTimeLimit(time_config_info)

    // 如果当前下单时间可选且不在运营限制时间内，则下单时间改为下单限制时间的开始时间
    const orderTime = moment(this.orderMoment.format('HH:mm'), 'HH:mm')

    if (!disabled && this.isSpanDisabled(orderTime)) {
      const [hour, minute] = start.split(':')
      this.orderMoment.set({ hour, minute })
    }
    if (
      orderDetailStore.orderDetail.order_date_time !==
      this.orderMoment.format('YYYY-MM-DD HH:mm:ss')
    ) {
      orderDetailStore.receiveChange({
        order_date_time: this.orderMoment.format('YYYY-MM-DD HH:mm:ss'),
      })
    }
    return (
      <Flex
        flex
        alignCenter
        className={time_config_info ? '' : 'b-order-add-servicetime-box'}
      >
        {time_config_info ? (
          <DatePicker
            date={this.orderMoment}
            max={moment(dateStart)}
            min={moment('2015-01-01')}
            onChange={this.handleChangeOrderDate}
            style={{ width: '240px' }}
            disabledClose
          />
        ) : (
          <Select
            className='b-order-select'
            style={{ width: 240 }}
            disabled
            data={[{ value: 0, text: i18next.t('请选择下单日期') }]}
            value={0}
          />
        )}
        <TimeSpanPicker
          className='b-width-60 gm-margin-lr-5'
          date={this.orderMoment}
          disabledSpan={this.isSpanDisabled}
          onChange={this.handleChangeOrderTime}
        >
          <Button
            className='gm-margin-lr-5'
            style={{ width: '60px' }}
            disabled={disabled}
          >
            {disabled ? i18next.t('时间') : this.orderMoment.format('HH:mm')}
          </Button>
        </TimeSpanPicker>
      </Flex>
    )
  }
}

export default RepairOrderTime
