import React from 'react'
import { i18next } from 'gm-i18n'
import { TimeSpanPicker, Flex, Select, Option, Button } from '@gmfe/react'
import _ from 'lodash'
import {
  getCycleList,
  getStartCycleList,
  getEndCycleList,
  cycleListToDayList,
} from 'gm-service/src/service_time/receive_time'
import { convertFlag2Date, isReceiveTimeValid, isOrderTimeValid } from '../util'
import { convertDay2Bit } from '../../common/util'
import moment from 'moment'
import PropTypes from 'prop-types'

function getOrderStartTime(start, orderTime = null) {
  const [h, m] = start.split(':')
  return moment(orderTime).startOf('day').add(h, 'hours').add(m, 'minutes')
}

function getFlag(m, orderTime = null) {
  const time = orderTime ? moment(orderTime) : moment()
  return Math.floor((m - time.startOf('day')) / (3600 * 24 * 1000))
}

function getRange(dayList, flag, orderTime = null) {
  const timeRange =
    _.find(dayList, (item) => getFlag(item[0], orderTime) === flag) || []
  const length = timeRange.length
  if (length) {
    const end = timeRange[length - 1]
    return {
      start: moment(timeRange[0].format('HH:mm'), 'HH:mm'),
      end: moment(end.format('HH:mm'), 'HH:mm'),
    }
  }
  return {}
}

function getDayListStartAndEnd(cycleList, startMoment) {
  return {
    dayListStart: cycleListToDayList(getStartCycleList(cycleList)),
    dayListEnd: cycleListToDayList(getEndCycleList(startMoment, cycleList)),
  }
}

function getStartAndEndRange(cycleList, cReceiveTime, orderTime) {
  const { flagStart, flagEnd, timeStart } = cReceiveTime
  let startMoment
  if (orderTime) {
    const timeStartStr = moment(timeStart).format('HH:mm')
    const orderDay = getOrderStartTime(timeStartStr, orderTime)
    startMoment = moment(orderDay).add(flagStart, 'days')
  } else {
    startMoment = moment(timeStart, 'HH:mm').add(flagStart, 'days')
  }

  const { dayListStart, dayListEnd } = getDayListStartAndEnd(
    cycleList,
    startMoment,
  )
  return {
    dayListStart,
    dayListEnd,
    rangeStart: getRange(dayListStart, flagStart, orderTime),
    rangeEnd: getRange(dayListEnd, flagEnd, orderTime),
  }
}

function getCurrentCycleList(
  time_config_info,
  date_time = null,
  filterFun = () => true,
) {
  const { receive_time_limit } = time_config_info
  const {
    start,
    end,
    e_span_time,
    s_span_time,
    receiveTimeSpan,
    receiveEndSpan,
  } = receive_time_limit
  return _.filter(
    getCycleList(
      {
        receiveEndSpan:
          receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time,
        r_start: start,
        r_end: end,
        e_span_time,
        receiveTimeSpan,
        s_span_time,
      },
      date_time,
    ),
    filterFun,
  )
}

function daylistToArray(dayList, orderTime = null) {
  const array = []
  _.forEach(dayList, (item) => {
    const flag = getFlag(item[0], orderTime)
    array.push(flag)
  })
  return array
}

function computeTimeData(time_config_info, order) {
  if (!(time_config_info && time_config_info.receive_time_limit)) return
  return computeReceiveTime(time_config_info, order)
}

function computeReceiveTime(time_config_info, order) {
  const { type, receive_time_limit } = time_config_info
  const {
    weekdays,
    customer_weekdays,
    e_span_time,
    s_span_time,
    receiveEndSpan,
    start,
  } = receive_time_limit
  const { date_time } = order
  const startMoment = getOrderStartTime(start, date_time)
  const filter = type === 2 ? weekdays & customer_weekdays : 127
  let cycleList = getCurrentCycleList(time_config_info, date_time, (item) => {
    const isCrossDay =
      receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time
    let flag = getFlag(item[0], date_time)
    if (
      isCrossDay &&
      moment(item[0]).isBefore(moment(startMoment).add(flag, 'day'))
    ) {
      flag = flag - 1
    }
    return convertDay2Bit(flag, date_time) & filter
  })

  if (type === 1) cycleList = _.slice(cycleList, 0, 1)
  const {
    rangeStart,
    rangeEnd,
    dayListStart,
    dayListEnd,
  } = getStartAndEndRange(cycleList, order, date_time)
  return {
    startDate: daylistToArray(dayListStart, date_time),
    endDate: daylistToArray(dayListEnd, date_time),
    startMinTime: rangeStart.start,
    startMaxTime: rangeStart.end,
    endMinTime: rangeEnd.start,
    endMaxTime: rangeEnd.end,
  }
}

class ReceiveTime extends React.Component {
  getRange(receiveTime) {
    const { order } = this.props
    const { time_config_info, date_time } = order
    const cycleList = getCurrentCycleList(time_config_info, date_time)
    return getStartAndEndRange(cycleList, receiveTime, date_time)
  }

  handleReceiveStartFlagChange = (value) => {
    const newFlagStart = Number(value)
    const { order } = this.props
    const { time_config_info, date_time } = order
    const { type, receive_time_limit } = time_config_info
    const {
      weekdays,
      customer_weekdays,
      receiveEndSpan,
      e_span_time,
      s_span_time,
      start,
      receiveTimeSpan,
    } = receive_time_limit
    const filter = type === 2 ? weekdays & customer_weekdays : 127
    // 略微复杂一点
    let newflagEnd = newFlagStart
    const isCrossDay =
      receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time
    const lastSpan = moment('00:00', 'HH:mm')
      .add(newFlagStart + 1, 'd')
      .add(-Number(receiveTimeSpan), 'm')
    const cycleList = getCurrentCycleList(time_config_info, date_time)
    const rangeStart = getRange(
      cycleListToDayList(getStartCycleList(cycleList)),
      newFlagStart,
      date_time,
    )
    let startMoment
    if (date_time) {
      const timeStartStr = moment(rangeStart.start).format('HH:mm')
      const sm = getOrderStartTime(timeStartStr, date_time)
      startMoment = moment(sm).add(newFlagStart, 'days')
    } else {
      startMoment = moment(rangeStart.start, 'HH:mm').add(newFlagStart, 'days')
    }

    // 兼容收货自然日限制
    if (filter !== 127 && convertDay2Bit(0, startMoment) & filter) {
      const startDay = moment(startMoment).startOf('day')
      if (
        !startDay.isSame(moment(date_time).startOf('day')) &&
        newFlagStart <= e_span_time
      ) {
        rangeStart.start = moment(start, 'HH:mm')
        startMoment = getOrderStartTime(start, startDay)
      }
    }

    if (lastSpan.isSameOrBefore(startMoment) && isCrossDay) {
      newflagEnd = newflagEnd + 1
    }
    const rangeEnd = getRange(
      cycleListToDayList(getEndCycleList(startMoment, cycleList)),
      newflagEnd,
      date_time,
    )
    this.props.onReceiveTimeChange({
      flagStart: newFlagStart,
      flagEnd: newflagEnd,
      timeStart: rangeStart.start,
      timeEnd: rangeEnd.end,
    })
  }

  handleReceiveStartTimeChange = (date) => {
    const { order } = this.props
    const { time_config_info, flagStart } = order
    const { receive_time_limit } = time_config_info
    const {
      receiveEndSpan,
      e_span_time,
      s_span_time,
      receiveTimeSpan,
    } = receive_time_limit
    const newStartMoment = moment(date)
    // 略微复杂一点
    let newflagEnd = flagStart
    const isCrossDay =
      receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time
    const lastSpan = moment('00:00', 'HH:mm')
      .add(1, 'd')
      .add(-Number(receiveTimeSpan), 'm') // 标准最后一个选项
    if (lastSpan.isSameOrBefore(newStartMoment) && isCrossDay) {
      newflagEnd = flagStart + 1
    }
    const { rangeEnd } = this.getRange({
      flagStart,
      flagEnd: newflagEnd,
      timeStart: newStartMoment,
    })
    this.props.onReceiveTimeChange({
      timeStart: newStartMoment,
      flagEnd: newflagEnd,
      timeEnd: rangeEnd.end,
    })
  }

  handleReceiveEndFlagChange = (value) => {
    const { order } = this.props
    const newFlagEnd = Number(value)
    const { flagStart, timeStart } = order
    const { rangeEnd } = this.getRange({
      flagStart,
      timeStart,
      flagEnd: newFlagEnd,
    })
    this.props.onReceiveTimeChange({
      flagEnd: newFlagEnd,
      timeEnd: rangeEnd.end,
    })
  }

  handleReceiveEndTimeChange = (date) => {
    this.props.onReceiveTimeChange({
      timeEnd: moment(date),
    })
  }

  handleDisabledSpan = (spanItem) => {
    const { flagStart, flagEnd, time_config_info } = this.props.order
    const {
      s_span_time,
      start,
      end,
      receiveEndSpan,
    } = time_config_info.receive_time_limit

    // 预售、且跨天、且起始和截止同一天、且不是第一天
    if (
      time_config_info.type === 2 &&
      receiveEndSpan === 1 &&
      flagStart === flagEnd &&
      flagStart > s_span_time
    ) {
      return (
        spanItem.isSameOrAfter(moment(end, 'HH:mm')) &&
        spanItem.isBefore(moment(start, 'HH:mm'))
      )
    }
    return false
  }

  render() {
    const { order } = this.props
    const { viewType, time_config_info, currentTime } = order
    let orderTimeValid = false
    let timeSpan
    if (time_config_info) {
      const {
        start,
        end,
        e_span_time,
        s_span_time,
      } = time_config_info.order_time_limit
      const { receiveTimeSpan } = time_config_info.receive_time_limit
      orderTimeValid = !isOrderTimeValid(
        viewType,
        currentTime,
        start,
        end,
        e_span_time,
        s_span_time,
      )
      timeSpan = receiveTimeSpan * 60 * 1000
    }

    const {
      startDate,
      endDate,
      startMinTime,
      startMaxTime,
      endMinTime,
      endMaxTime,
    } = computeTimeData(time_config_info, order) || {}
    const disabled =
      !time_config_info ||
      !isReceiveTimeValid(time_config_info, order.date_time) ||
      orderTimeValid

    return (
      <Flex flex alignCenter>
        <Select
          value={order.flagStart}
          onChange={this.handleReceiveStartFlagChange}
          className='b-order-create-receive-time'
          disabled={disabled}
        >
          {
            <Option disabled={!disabled} value={-1}>
              {i18next.t('开始日期')}
            </Option>
          }
          {_.map(startDate, (dateFlag) => {
            return (
              <Option key={dateFlag} value={dateFlag}>
                {convertFlag2Date(dateFlag, order.date_time)}
              </Option>
            )
          })}
        </Select>
        <TimeSpanPicker
          min={startMinTime}
          max={startMaxTime}
          beginTime={startMinTime}
          endTime={startMaxTime}
          date={order.timeStart === '' ? new Date() : order.timeStart}
          span={Number(timeSpan)}
          disabledSpan={this.handleDisabledSpan}
          onChange={this.handleReceiveStartTimeChange}
          disabled={disabled}
        >
          <Button
            className='gm-margin-lr-5'
            style={{ width: '80px' }}
            disabled={disabled}
          >
            {disabled
              ? i18next.t('开始时间')
              : moment(order.timeStart).format('HH:mm')}
          </Button>
        </TimeSpanPicker>
        <span className='gm-margin-lr-5'>~</span>
        <Select
          value={order.flagEnd}
          onChange={this.handleReceiveEndFlagChange}
          className='b-order-create-receive-time'
          disabled={disabled}
        >
          {
            <Option disabled={!disabled} value={-1}>
              {i18next.t('结束日期')}
            </Option>
          }
          {_.map(endDate, (dateFlag) => {
            return (
              <Option key={dateFlag} value={dateFlag}>
                {convertFlag2Date(dateFlag, order.date_time)}
              </Option>
            )
          })}
        </Select>
        <TimeSpanPicker
          min={endMinTime}
          max={endMaxTime}
          beginTime={endMinTime}
          endTime={endMaxTime}
          date={order.timeEnd === '' ? new Date() : order.timeEnd}
          span={Number(timeSpan)}
          onChange={this.handleReceiveEndTimeChange}
        >
          <Button
            className='gm-margin-lr-5'
            style={{ width: '80px' }}
            disabled={disabled}
          >
            {disabled
              ? i18next.t('结束时间')
              : moment(order.timeEnd).format('HH:mm')}
          </Button>
        </TimeSpanPicker>
      </Flex>
    )
  }
}

ReceiveTime.propTypes = {
  order: PropTypes.object.isRequired,
  onReceiveTimeChange: PropTypes.func.isRequired,
}

export default ReceiveTime
