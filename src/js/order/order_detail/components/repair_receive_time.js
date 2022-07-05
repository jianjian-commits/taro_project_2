import { i18next } from 'gm-i18n'
import React from 'react'
import { DatePicker, Flex, TimeSpanPicker, Button } from '@gmfe/react'
import moment from 'moment'
import orderDetailStore from '../../store'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

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

const getTime = (date, time) => {
  const _date = date ? moment(date) : moment()
  return _date.hour(time.split(':')[0]).minute(time.split(':')[1]).second(0)
}

const crossDay = (time_config_info) => {
  const { s_span_time, e_span_time, receiveEndSpan } =
    time_config_info && time_config_info.receive_time_limit

  const configCrossDay =
    receiveEndSpan >= 0 ? receiveEndSpan : e_span_time - s_span_time
  return configCrossDay
}

const getReceiveTimeLimit = (
  time_config_info,
  { dateStart, dateEnd, timeStart }
) => {
  const { start, end, receiveTimeSpan } = time_config_info.receive_time_limit

  const configCrossDay = crossDay(time_config_info)
  const selectCrossDay = moment(dateStart, ' YYYY-MM-DD').isBefore(
    moment(dateEnd, ' YYYY-MM-DD')
  )
  let endMin = null
  let endMax = null
  const startMin = start
  let startMax = null
  let mmax = null
  const _start = moment(timeStart, 'HH:mm').format('HH:mm')

  if (configCrossDay && selectCrossDay) {
    // 跨天
    endMin = getTime(null, _start)
    const max = moment().add(1, 'day').startOf('day')

    while (endMin.isSameOrBefore(max)) {
      endMin = endMin.add(receiveTimeSpan, 'm')
    }
    mmax = getTime(endMin, end)
  } else {
    // 不跨天
    endMin = moment(_start, 'HH:mm').add(receiveTimeSpan, 'm')
    mmax = configCrossDay ? moment(endMin).endOf('day') : getTime(endMin, end)
  }

  endMax = endMin.clone()
  while (endMax.isSameOrBefore(mmax)) {
    endMax = endMax.add(receiveTimeSpan, 'm')
  }
  const _end = getTime(endMin, end)
  if (endMax.isAfter(_end)) {
    endMax = endMax.subtract(receiveTimeSpan, 'm')
  }

  startMax =
    configCrossDay && selectCrossDay
      ? endMin.clone().subtract(receiveTimeSpan, 'm')
      : endMax.clone().subtract(receiveTimeSpan, 'm')

  return { startMin, startMax, endMin, endMax }
}

const computeReceiveTime = (
  time_config_info,
  { dateStart, dateEnd, timeStart, timeEnd }
) => {
  let endDateMin = dateStart
  let endDateMax = dateStart
  let startTimeMax = timeEnd
  let startTimeMin = timeStart
  let endTimeMin = timeStart
  let endTimeMax = timeEnd

  if (time_config_info) {
    const configCrossDay = crossDay(time_config_info)
    const { startMin, startMax, endMin, endMax } = getReceiveTimeLimit(
      time_config_info,
      {
        dateStart,
        dateEnd,
        timeStart,
      }
    )
    startTimeMin = startMin
    startTimeMax = startMax.format('HH:mm')
    endTimeMin = endMin.format('HH:mm')
    endTimeMax = endMax.format('HH:mm')
    endDateMax = configCrossDay
      ? moment(dateStart).add(1, 'd')
      : moment(dateStart)
    const _start = moment(timeStart, 'HH:mm').format('HH:mm')
    const nowStart = moment(getTime(null, _start))
    const MaxStart = moment(getTime(null, startTimeMax))

    // 开始时间选择最后一个时间点，结束日期跨天只能选择后一天
    if (nowStart.isSameOrAfter(MaxStart)) {
      endDateMin = moment(endDateMin).add(1, 'd')
    }
  }

  return {
    endMax: endDateMax,
    endMin: endDateMin,
    endTimeMin,
    endTimeMax,
    startTimeMin,
    startTimeMax,
  }
}

@observer
class ReceiveTimeRepair extends React.Component {
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
    const { time_config_info } = this.props.order
    const { type } = time_config_info
    const {
      s_span_time,
      e_span_time,
      receiveEndSpan,
    } = time_config_info.receive_time_limit
    const maxDate = getStartMaxDate({
      type,
      e_span_time,
      s_span_time,
      receiveEndSpan,
    })

    orderDetailStore.receiveChange({
      dateStart: maxDate,
      dateEnd: this.getEndDateByStart(maxDate),
    })
  }

  handleReceiveStartDateChange = (date) => {
    const newDateStart = moment(date)
    const { order } = this.props
    const { time_config_info } = order
    const { start } = time_config_info.receive_time_limit
    const newDateEnd = this.getEndDateByStart(newDateStart)

    // 后面所有时间需要重新计算更新
    const { endMax } = getReceiveTimeLimit(time_config_info, {
      dateStart: newDateStart,
      dateEnd: newDateEnd,
      timeStart: start,
    })

    const changed = {
      dateStart: newDateStart,
      dateEnd: this.getEndDateByStart(newDateStart),
      timeStart: start,
      timeEnd: endMax,
    }
    orderDetailStore.receiveChange(changed)
  }

  handleReceiveStartTimeChange = (time) => {
    orderDetailStore.receiveChange({
      timeStart: moment(time).format('HH:mm'),
    })
  }

  handleReceiveEndDateChange = (date) => {
    const newDateEnd = moment(date)
    const { order } = this.props
    const { time_config_info, dateStart, timeStart } = order
    const { start } = time_config_info.receive_time_limit
    const selectCross = newDateEnd.isAfter(dateStart, 'day')
    let _start = timeStart

    // 根据是否跨天来计算更新结束时间的选择
    if (selectCross) {
      _start = start
    }

    const { endMax } = getReceiveTimeLimit(time_config_info, {
      dateStart,
      dateEnd: newDateEnd,
      timeStart: _start,
    })

    orderDetailStore.receiveChange({
      dateEnd: newDateEnd,
      timeEnd: endMax,
    })
  }

  handleReceiveEndTimeChange = (time) => {
    orderDetailStore.receiveChange({
      timeEnd: moment(time).format('HH:mm'),
    })
  }

  render() {
    const { order } = this.props
    const { time_config_info, dateStart, dateEnd, timeStart, timeEnd } = order
    const {
      endMax,
      endMin,
      endTimeMax,
      endTimeMin,
      startTimeMin,
      startTimeMax,
    } = computeReceiveTime(time_config_info, { dateStart, dateEnd, timeStart })
    let timeSpan = 15 * 60 * 1000
    if (time_config_info) {
      const { receiveTimeSpan } = time_config_info.receive_time_limit
      timeSpan = receiveTimeSpan * 60 * 1000
    }

    return (
      <Flex alignCenter>
        <Flex flex alignCenter>
          <DatePicker
            date={dateStart}
            onChange={this.handleReceiveStartDateChange}
            placeholder={i18next.t('开始时间')}
            style={{ width: '110px' }}
            disabledClose
          />
          <TimeSpanPicker
            className='b-width-60 gm-margin-lr-5'
            date={moment(timeStart, 'HH:mm')}
            min={moment(startTimeMin, 'HH:mm')}
            max={moment(startTimeMax, 'HH:mm')}
            beginTime={moment(startTimeMin, 'HH:mm')}
            endTime={moment(startTimeMax, 'HH:mm')}
            span={Number(timeSpan)}
            onChange={this.handleReceiveStartTimeChange}
          >
            <Button className='gm-margin-left-5' style={{ width: '55px' }}>
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
            style={{ width: '110px' }}
            disabledClose
          />
          <TimeSpanPicker
            className='b-width-60 gm-margin-lr-5'
            date={moment(timeEnd, 'HH:mm')}
            min={moment(endTimeMin, 'HH:mm')}
            max={moment(endTimeMax, 'HH:mm')}
            beginTime={moment(endTimeMin, 'HH:mm')}
            endTime={moment(endTimeMax, 'HH:mm')}
            span={Number(timeSpan)}
            onChange={this.handleReceiveEndTimeChange}
          >
            <Button className='gm-margin-left-5' style={{ width: '55px' }}>
              {moment(timeEnd, 'HH:mm').format('HH:mm')}
            </Button>
          </TimeSpanPicker>
        </Flex>
      </Flex>
    )
  }
}

ReceiveTimeRepair.propTypes = {
  order: PropTypes.object,
}

export default ReceiveTimeRepair
