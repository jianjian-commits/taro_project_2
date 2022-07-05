import { DateRangePicker } from '@gmfe/react'
import React from 'react'
import moment from 'moment/moment'
import PropTypes from 'prop-types'

const DateRangeHOC = ({ begin, beginMin = 90, range = 30, ...props }) => {
  const dayBefore90 = moment().startOf('day').add(-beginMin, 'd')
  const today = moment().startOf('day')

  const _begin = begin
  const disabledDate = (d, { begin, end }) => {
    const dayAfter30 = moment(begin).add(range, 'd')
    const dMax = dayAfter30.isAfter(today) ? today : dayAfter30
    let dMin = null
    let min = null
    if (+moment(begin) === +moment(_begin)) {
      dMin = dayBefore90
    } else {
      min = moment(begin)
      // 选择的第一个可能是结束日期，相对范围可以 往前 / 往后 推
      const days = dMax.diff(moment(begin), 'day')
      dMin = min.subtract(days, 'day')
    }

    if (+moment(d) >= +dMin && +moment(d) <= dMax) {
      return false
    }
    return true
  }

  return (
    <DateRangePicker begin={begin} disabledDate={disabledDate} {...props} />
  )
}

DateRangeHOC.propTypes = {
  begin: PropTypes.object,
  beginMin: PropTypes.number,
  range: PropTypes.number,
}

export default DateRangeHOC
