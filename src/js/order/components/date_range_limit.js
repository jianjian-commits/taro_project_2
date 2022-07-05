import { searchDateTypes } from '../../common/enum'
import { endDateRanger, startDateRanger } from '../util'
import _ from 'lodash'
import moment from 'moment'

const getMaxEndConfig = (service_times) => {
  const maxEndConfig = _.maxBy(
    service_times,
    (serivceTime) => serivceTime.receive_time_limit.e_span_time,
  )
  return maxEndConfig
}

const getMaxSpanEnd = (
  dateType,
  service_times,
  time_config_id,
  maxEndConfig,
) => {
  let maxSpanEnd = null

  if (dateType === searchDateTypes.CYCLE.type) {
    const currentServiceTime = _.find(
      service_times,
      (s) => s._id === time_config_id,
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

const disabledDate = (data, d, { begin, end }, dealy) => {
  const { service_times, filter } = data
  const { dateType, time_config_id } = filter

  const maxEndConfig = getMaxEndConfig(service_times)
  const _dMax = endDateRanger(
    dateType,
    maxEndConfig &&
      maxEndConfig.receive_time_limit &&
      maxEndConfig.receive_time_limit.e_span_time,
    begin,
    dealy,
  ).max

  const dMin = dealy
    ? +moment(begin).subtract(6, 'm').startOf('day')
    : +moment(begin).subtract(61, 'd').startOf('day')

  const dMax = +moment(_dMax).startOf('day')

  const selectBegin = +moment(begin).startOf('day')
  const initBegin = +moment(filter.begin).startOf('day')
  const day = +moment(d).startOf('day')

  if (selectBegin === initBegin && end) {
    const maxSpanEnd = getMaxSpanEnd(
      dateType,
      service_times,
      time_config_id,
      maxEndConfig,
    )
    // 重新选择日期时，回归初始最大值
    const _dMax = startDateRanger(dateType, maxSpanEnd, begin).max
    return !(day <= +moment(_dMax).startOf('day'))
  }

  return !(day <= dMax && day >= dMin)
}

const getCycleDateLimit = (service_times, filter, dealy) => {
  const { dateType, begin, time_config_id } = filter

  const maxEndConfig = getMaxEndConfig(service_times)
  const maxSpanEnd = getMaxSpanEnd(
    dateType,
    service_times,
    time_config_id,
    maxEndConfig,
  )

  const beginProps = {
    max: startDateRanger(dateType, maxSpanEnd, begin).max,
  }
  const endProps = endDateRanger(
    dateType,
    maxEndConfig &&
      maxEndConfig.receive_time_limit &&
      maxEndConfig.receive_time_limit.e_span_time,
    begin,
    dealy,
  )

  return { beginProps, endProps }
}

export { getMaxEndConfig, disabledDate, getCycleDateLimit }
