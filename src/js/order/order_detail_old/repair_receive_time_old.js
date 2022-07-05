// 暂时应用于移动端，后续废弃
import { i18next } from 'gm-i18n'
import React from 'react'
import { DatePicker, Flex, TimeSpanPicker, Button } from '@gmfe/react'
import moment from 'moment'
import orderDetailStore from './detail_store_old'

const getStartMaxDate = ({
  type,
  e_span_time,
  s_span_time,
  receiveEndSpan,
}) => {
  // 不跨天最晚的开始收货日期是昨天， 跨天时是最晚的开始收货日期前天
  let maxDate = moment()
    .subtract(1, 'd')
    .subtract(e_span_time - s_span_time, 'd')

  // 预售
  if (type === 2) {
    // 不跨天
    if (receiveEndSpan === 0) {
      maxDate = moment().subtract(1, 'd')
    } else {
      maxDate = moment().subtract(2, 'd')
    }
  }
  return maxDate
}

class ReceiveTimeRepair extends React.Component {
  constructor(props) {
    super(props)

    const { time_config_info, dateStart, timeStart, timeEnd } = props.order
    const { type } = time_config_info
    let maxDate = dateStart
    let crossStart = timeStart
    let crossEnd = timeEnd
    if (time_config_info) {
      const {
        s_span_time,
        e_span_time,
        receiveEndSpan,
        start,
        end,
      } = time_config_info.receive_time_limit
      maxDate = getStartMaxDate({
        type,
        e_span_time,
        s_span_time,
        receiveEndSpan,
      })
      crossStart = receiveEndSpan > 0 ? '00:00' : start
      crossEnd = end
    }

    this.state = {
      startMax: maxDate,
      endMax: maxDate,
      endMin: maxDate,
      endTimeMin: crossStart,
      endTimeMax: crossEnd,
    }
  }

  getEndDateByStart(startDate, nextProps = null) {
    const { order } = nextProps || this.props
    const { time_config_info } = order
    const { type } = time_config_info
    const {
      s_span_time,
      e_span_time,
      receiveEndSpan,
    } = time_config_info.receive_time_limit

    // 非预售
    let endLimit = moment(startDate).add(e_span_time - s_span_time, 'd')

    if (type === 2) {
      if (receiveEndSpan === 0) {
        endLimit = startDate
      } else {
        endLimit = moment(startDate).add(1, 'd')
      }
    }

    return endLimit
  }

  componentDidMount() {
    const { startMax } = this.state
    const { order } = this.props
    const { time_config_info } = order
    const { start, end } =
      time_config_info && time_config_info.receive_time_limit

    orderDetailStore.receiveChange({
      timeStart: start,
      timeEnd: end,
      dateStart: startMax,
      dateEnd: this.getEndDateByStart(startMax),
    })
  }

  handleReceiveStartDateChange = (date) => {
    const newDateStart = moment(date)
    this.setState({
      endMin: newDateStart,
      endMax: this.getEndDateByStart(newDateStart),
    })
    const changed = {
      dateStart: newDateStart,
      dateEnd: this.getEndDateByStart(newDateStart),
    }
    orderDetailStore.receiveChange(changed)
  }

  handleReceiveStartTimeChange = (time) => {
    const { order } = this.props
    const { time_config_info, dateEnd, dateStart } = order
    const { receiveTimeSpan, receiveEndSpan, e_span_time, s_span_time, end } =
      time_config_info && time_config_info.receive_time_limit

    // 判断是否当天最后一个周期&&跨天
    const newStartTime = moment(time)
    const nowTime = newStartTime.format('HH:mm')
    const isCross = dateEnd.isSame(dateStart, 'day')
    const nextTime = newStartTime
      .add(Number(receiveTimeSpan), 'm')
      .format('HH:mm')
    const lastSpan = moment('00:00', 'HH:mm')
      .add(1, 'd')
      .add(-Number(receiveTimeSpan), 'm')
    const isCrossDay =
      receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time

    if (isCross && !lastSpan.isSameOrBefore(newStartTime)) {
      orderDetailStore.receiveChange({
        timeStart: nowTime,
        timeEnd: nextTime,
      })
      this.setState({
        endTimeMin: nextTime,
      })
      return
    }

    this.setState({
      endMax: this.getEndDateByStart(dateStart),
      endTimeMin: nextTime,
    })
    orderDetailStore.receiveChange({
      timeStart: nowTime,
    })

    if (lastSpan.isSameOrBefore(newStartTime) && isCrossDay) {
      this.setState({
        endMin: this.getEndDateByStart(dateStart),
        endTimeMax: end,
      })
      orderDetailStore.receiveChange({
        dateEnd: this.getEndDateByStart(dateStart),
        timeEnd: end,
      })
    } else {
      const { endTimeMax, endTimeMin } = this.state
      const endTimeMinChange = isCrossDay
        ? lastSpan.add(receiveTimeSpan, 'm').format('HH:mm')
        : endTimeMin
      const endTimeMaxChange = isCrossDay ? end : endTimeMax
      this.setState({
        endMin: dateStart,
        endMax: dateEnd,
        endTimeMin: endTimeMinChange,
        endTimeMax: endTimeMaxChange,
      })
    }
  }

  handleReceiveEndDateChange = (date) => {
    const newDateEnd = moment(date)

    const { order } = this.props
    const { dateStart, timeStart, time_config_info, dateEnd, timeEnd } = order
    const { receiveTimeSpan, start, receiveEndSpan } =
      time_config_info && time_config_info.receive_time_limit
    const isCross = newDateEnd.isSame(dateStart, 'day')
    const lastSpan = moment('00:00', 'HH:mm')
      .add(1, 'd')
      .add(-Number(receiveTimeSpan), 'm')

    this.setState({
      endMax: dateEnd,
    })

    const { endTimeMin, endTimeMax } = this.state
    let endTimeMaxChange = endTimeMax
    let endTimeMinChange = endTimeMin

    if (isCross) {
      endTimeMinChange = moment(timeStart, 'HH:mm')
        .add(receiveTimeSpan, 'm')
        .format('HH:mm')
      endTimeMaxChange = receiveEndSpan ? lastSpan.format('HH:mm') : timeEnd
    } else {
      endTimeMaxChange = start
      endTimeMinChange = lastSpan.add(receiveTimeSpan, 'm').format('HH:mm')
    }
    this.setState({
      endTimeMax: endTimeMaxChange,
      endTimeMin: endTimeMinChange,
    })
    orderDetailStore.receiveChange({
      dateEnd: newDateEnd,
      timeEnd: endTimeMaxChange,
    })
  }

  handleReceiveEndTimeChange = (time) => {
    orderDetailStore.receiveChange({
      timeEnd: moment(time).format('HH:mm'),
    })
  }

  render() {
    const { endMax, endMin, endTimeMax, endTimeMin } = this.state
    const { order } = this.props
    const { time_config_info, dateStart, dateEnd, timeStart, timeEnd } = order

    let start = timeStart
    let end = timeEnd
    let timeSpan = 15 * 60 * 1000
    if (time_config_info) {
      const {
        receiveTimeSpan,
        receiveEndSpan,
      } = time_config_info.receive_time_limit
      start = time_config_info.receive_time_limit.start
      end = receiveEndSpan
        ? moment('00:00', 'HH:mm')
            .add(1, 'd')
            .add(-Number(receiveTimeSpan), 'm')
            .format('HH:mm')
        : moment(end, 'HH:mm')
            .add(1, 'd')
            .add(-Number(receiveTimeSpan), 'm')
            .format('HH:mm')
      timeSpan = receiveTimeSpan * 60 * 1000
    }

    return (
      <Flex alignCenter className='gm-padding-5'>
        <Flex className='b-order-detail-header-label gm-text-desc'>
          {i18next.t('收货时间')}：
        </Flex>
        <Flex flex alignCenter>
          <DatePicker
            date={dateStart}
            onChange={this.handleReceiveStartDateChange}
            placeholder={i18next.t('开始时间')}
          />
          <TimeSpanPicker
            className='b-width-60 gm-margin-lr-5'
            date={moment(timeStart, 'HH:mm')}
            min={moment(start, 'HH:mm')}
            max={moment(end, 'HH:mm')}
            span={Number(timeSpan)}
            onChange={this.handleReceiveStartTimeChange}
          >
            <Button className='gm-margin-lr-5' style={{ width: '60px' }}>
              {moment(timeStart, 'HH:mm').format('HH:mm')}
            </Button>
          </TimeSpanPicker>
          <span className='gm-margin-lr-5'>~</span>
          <DatePicker
            date={dateEnd}
            max={endMax}
            min={endMin}
            onChange={this.handleReceiveEndDateChange}
            placeholder={i18next.t('结束时间')}
          />
          <TimeSpanPicker
            className='b-width-60 gm-margin-lr-5'
            date={moment(timeEnd, 'HH:mm')}
            min={moment(endTimeMin, 'HH:mm')}
            max={moment(endTimeMax, 'HH:mm')}
            span={Number(timeSpan)}
            onChange={this.handleReceiveEndTimeChange}
          >
            <Button className='gm-margin-lr-5' style={{ width: '60px' }}>
              {moment(timeEnd, 'HH:mm').format('HH:mm')}
            </Button>
          </TimeSpanPicker>
        </Flex>
      </Flex>
    )
  }
}

export default ReceiveTimeRepair
