import moment from 'moment'
import { searchDateTypes } from 'common/enum'
import _ from 'lodash'
import DateFilter from 'common/components/date_range_filter'
import React from 'react'
import storeOrder from '../store/store_order'
import storeSpu from '../store/store_spu'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

const today = moment()
function endDateRanger(type, e_span_time, begin, delay = 15) {
  const daysDelay = moment(begin).add(delay, 'd')

  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    const daysWithSpan = moment().add(e_span_time, 'd')
    const maxTemp = daysWithSpan.isAfter(daysDelay) ? daysDelay : daysWithSpan

    return {
      min: begin,
      max: maxTemp,
    }
  }

  return {
    min: begin,
    max: daysDelay.isAfter(today) ? today : daysDelay,
  }
}

function startDateRanger(type, e_span_time) {
  if (
    (type === searchDateTypes.RECEIVE.type ||
      type === searchDateTypes.CYCLE.type) &&
    e_span_time
  ) {
    return {
      max: moment().add(e_span_time, 'd'),
    }
  }

  return {
    max: today,
  }
}
const getMaxEndConfig = (service_times) => {
  const maxEndConfig = _.maxBy(
    service_times,
    (serivceTime) => serivceTime.receive_time_limit.e_span_time
  )
  return maxEndConfig
}
const getMaxSpanEnd = (
  dateType,
  service_times,
  time_config_id,
  maxEndConfig
) => {
  let maxSpanEnd = null

  if (dateType === searchDateTypes.CYCLE.type) {
    const currentServiceTime = _.find(
      service_times,
      (s) => s._id === time_config_id
    )
    maxSpanEnd =
      currentServiceTime && currentServiceTime.receive_time_limit.e_span_time
  } else if (
    dateType === searchDateTypes.RECEIVE.type ||
    dateType === searchDateTypes.ORDER.type
  ) {
    maxSpanEnd = maxEndConfig && maxEndConfig.receive_time_limit.e_span_time
  }
  return maxSpanEnd
}
const disabledDate = (data, d, { begin, end }) => {
  const { service_times, filter } = data
  const { dateType, time_config_id } = filter

  const maxEndConfig = getMaxEndConfig(service_times)
  const _dMax = endDateRanger(
    dateType,
    maxEndConfig &&
      maxEndConfig.receive_time_limit &&
      maxEndConfig.receive_time_limit.e_span_time,
    begin
  ).max
  const dMin = +moment(begin).subtract(15, 'd').startOf('day')
  const dMax = +moment(_dMax).startOf('day')

  const selectBegin = +moment(begin).startOf('day')
  const initBegin = +moment(filter.begin).startOf('day')
  const day = +moment(d).startOf('day')

  if (selectBegin === initBegin && end) {
    const maxSpanEnd = getMaxSpanEnd(
      dateType,
      service_times,
      time_config_id,
      maxEndConfig
    )
    // 重新选择日期时，回归初始最大值
    const _dMax = startDateRanger(dateType, maxSpanEnd, begin).max
    return !(day <= +moment(_dMax).startOf('day'))
  }
  return !(day <= dMax && day >= dMin)
}
const getCycleDateLimit = (service_times, filter) => {
  const { dateType, begin, time_config_id } = filter

  const maxEndConfig = getMaxEndConfig(service_times)
  const maxSpanEnd = getMaxSpanEnd(
    dateType,
    service_times,
    time_config_id,
    maxEndConfig
  )

  const beginProps = {
    max: startDateRanger(dateType, maxSpanEnd, begin).max,
  }
  const endProps = endDateRanger(
    dateType,
    maxEndConfig &&
      maxEndConfig.receive_time_limit &&
      maxEndConfig.receive_time_limit.e_span_time,
    begin
  )

  return { beginProps, endProps }
}

const LimitDateFilter = observer(({ type, ...rest }) => {
  let store
  if (type === 'order') {
    store = storeOrder
  } else {
    store = storeSpu
  }

  const getCycleDateLimits = () => {
    const { begin, dateType, time_config_id } = store.searchQuery
    const filter = { begin, dateType, time_config_id }
    return getCycleDateLimit(store.service_times, filter)
  }

  const _disabledDate = (d, { begin, end }) => {
    const { time_config_id, dateType } = store.searchQuery
    const filter = {
      begin: store.searchQuery.begin,
      dateType,
      time_config_id,
    }
    return disabledDate({ service_times: store.service_times, filter }, d, {
      begin,
      end,
    })
  }

  const setServeDate = (beginTime, endTime) => {
    const {
      service_times,
      searchQuery: { time_config_id },
    } = store
    // "23:30" "00:00" 0
    const {
      order_time_limit: { end, start, e_span_time },
    } = service_times.filter((s) => s._id === time_config_id)[0]
    const endArr = end.split(':')
    const startArr = start.split(':')

    beginTime = moment(beginTime).set({
      hour: startArr[0],
      minute: startArr[1],
    })
    endTime = moment(endTime)
      .add(e_span_time, 'days')
      .set({ hour: endArr[0], minute: endArr[1] })

    return {
      begin: beginTime,
      end: endTime,
    }
  }

  const operationDateFormat = ({ begin, end }) => {
    // 结束时间超过开始时间15天
    if (
      moment(begin).isSame(store.searchQuery.begin) &&
      moment(end).isAfter(moment(begin).add(15, 'd'), 'd')
    ) {
      begin = moment(end).subtract(15, 'd')
    }
    // 开始时间超过结束时间15天
    if (
      moment(end).isSame(store.searchQuery.end) &&
      moment(begin).isBefore(moment(end).subtract(15, 'd'), 'd')
    ) {
      end = moment(begin).add(15, 'd')
    }

    return setServeDate(begin, end)
  }

  const handleDateChange = (date) => {
    const { dateType, begin, end, time_config_id } = date
    if (dateType) {
      store.changeSearchQuery({ dateType })
    } else if (begin && end) {
      // 按运营周期
      let operateDate
      if (store.searchQuery.dateType === '2') {
        operateDate = operationDateFormat(date)
      }
      store.changeSearchQuery(operateDate || { begin, end })
    } else if (time_config_id) {
      store.changeSearchQuery({ time_config_id })
    }
    store.getRemarkList()
  }

  const limitDates = [_disabledDate, getCycleDateLimits, _disabledDate]

  return (
    <DateFilter
      {...rest}
      enabledTimeSelect
      limitDates={limitDates}
      onDateFilterChange={handleDateChange}
    />
  )
})

LimitDateFilter.propTypes = {
  type: PropTypes.string.isRequired,
}

export default LimitDateFilter
