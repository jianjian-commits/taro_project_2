import moment from 'moment'
import { returnDateByFlag } from '../../../common/filter'

const getDayList = (maxDay = 15) => {
  const days = []
  let i = 0
  while (i < maxDay) {
    days.push({
      id: i,
      text: returnDateByFlag(i),
    })
    i++
  }
  return days
}

const HHmmToDate = (HHmm) =>
  moment({
    hour: HHmm.split(':')[0],
    minute: HHmm.split(':')[1],
  })

const HHmmToMoment = (HHmm, day) => {
  return moment(HHmmToDate(HHmm)).add(day || 0, 'day')
}

const HHmmAdd30Minutes = (HHmm) => {
  return moment(HHmm, 'HH:mm').add(30, 'minutes').format('HH:mm')
}

// 预售运营时间修正
// 新时间配置做各种数据的合理性判断和自动修正
const preProcessState = (value) => {
  // 下单时间修正
  const orderStart = HHmmToMoment(value.order_time_limit.start)
  const orderEnd = HHmmToMoment(
    value.order_time_limit.end,
    value.order_time_limit.e_span_time,
  )

  // 用户下单时间限制, 用户下单时间不超过24小时
  if (orderStart >= orderEnd || moment(orderStart).add(1, 'd') < orderEnd) {
    value.order_time_limit.end = value.order_time_limit.start
  }

  // ***************************************************************
  // 用户可选最早收货日期与用户可选最晚收货日期修正
  const userReceiveStart = HHmmToMoment(
    '0:00',
    value.receive_time_limit.s_span_time,
  )
  const userReceiveEnd = HHmmToMoment(
    '0:00',
    value.receive_time_limit.e_span_time,
  )
  if (userReceiveStart > userReceiveEnd) {
    value.receive_time_limit.e_span_time = value.receive_time_limit.s_span_time
  }

  // 如果用户可选最早收货日期为当天 0
  if (value.receive_time_limit.s_span_time === 0) {
    // 每日收货时间开始大于用户下单时间开始
    if (
      HHmmToMoment(value.receive_time_limit.start) <
      HHmmToMoment(value.order_time_limit.start)
    ) {
      value.receive_time_limit.start = value.order_time_limit.start
    }

    // 每日收货时间截止大于用户下单时间截止
    if (
      HHmmToMoment(
        value.receive_time_limit.end,
        value.receive_time_limit.receiveEndSpan,
      ) <
      HHmmToMoment(
        value.order_time_limit.end,
        value.order_time_limit.e_span_time,
      )
    ) {
      value.receive_time_limit.receiveEndSpan =
        value.order_time_limit.e_span_time
      value.receive_time_limit.end = value.order_time_limit.end
    }

    // 最晚出库不能早于用户下单时间限制
    if (
      HHmmToMoment(
        value.final_distribute_time,
        value.final_distribute_time_span,
      ) <
      HHmmToMoment(
        value.order_time_limit.end,
        value.order_time_limit.e_span_time,
      )
    ) {
      value.final_distribute_time_span = value.order_time_limit.e_span_time
      value.final_distribute_time = value.order_time_limit.end
    }
  }

  // ***************************************************************
  // 每天收货时间修正
  const dairyReceiveStart = HHmmToMoment(value.receive_time_limit.start)
  const dairyReceiveEnd = HHmmToMoment(
    value.receive_time_limit.end,
    value.receive_time_limit.receiveEndSpan,
  )

  // 收货开始，结束时间相等
  if (dairyReceiveStart.isSame(dairyReceiveEnd)) {
    value.receive_time_limit.end = HHmmAdd30Minutes(
      value.receive_time_limit.start,
    )
  }

  if (dairyReceiveStart > dairyReceiveEnd) {
    value.receive_time_limit.end = HHmmAdd30Minutes(
      value.receive_time_limit.start,
    )
  }
  // 每天收货时间不超过24小时
  if (moment(dairyReceiveStart).add(1, 'd') < dairyReceiveEnd) {
    value.receive_time_limit.end = value.receive_time_limit.start
  }

  // 每日收货时间结束大于用户下单时间
  if (
    value.receive_time_limit.s_span_time === 0 &&
    dairyReceiveEnd < orderEnd
  ) {
    value.receive_time_limit.receiveEndSpan = value.order_time_limit.e_span_time
    value.receive_time_limit.end = value.order_time_limit.end
  }

  // ***************************************************************
  // 出库时间修正
  // 最晚出库时间不能迟于收货时间截止
  if (
    HHmmToMoment(
      value.final_distribute_time,
      value.final_distribute_time_span,
    ) >
    HHmmToMoment(
      value.receive_time_limit.end,
      value.receive_time_limit.receiveEndSpan,
    )
  ) {
    value.final_distribute_time = value.receive_time_limit.end
    value.final_distribute_time_span = value.receive_time_limit.receiveEndSpan
  }

  return value
}

// 普通运营时间修正
// 做各种数据的合理性判断和自动修正
const processState = (value) => {
  const orderStart = HHmmToMoment(value.order_time_limit.start)
  const orderEnd = HHmmToMoment(
    value.order_time_limit.end,
    value.order_time_limit.e_span_time,
  )
  const finalDistribute = HHmmToMoment(
    value.final_distribute_time,
    value.final_distribute_time_span,
    'day',
  )

  // 用户下单时间限制, 用户下单时间不超过24小时； 收货开始，结束时间不能相等
  if (orderStart >= orderEnd || moment(orderStart).add(1, 'd') < orderEnd) {
    value.order_time_limit.end = value.order_time_limit.start
  }

  // 最晚出库时间设置
  if (finalDistribute < orderEnd) {
    value.final_distribute_time_span = value.order_time_limit.e_span_time
    value.final_distribute_time = value.order_time_limit.end
  }

  const receiveStart = HHmmToMoment(
    value.receive_time_limit.start,
    value.receive_time_limit.s_span_time,
  )
  const receiveEnd = HHmmToMoment(
    value.receive_time_limit.end,
    value.receive_time_limit.e_span_time,
  )
  // 收货时间开始限制
  if (receiveStart < orderStart) {
    value.receive_time_limit.s_span_time = 0
    value.receive_time_limit.start = value.order_time_limit.start
  }

  // 收货时间结束限制
  if (receiveEnd < receiveStart) {
    value.receive_time_limit.e_span_time = value.receive_time_limit.s_span_time
    value.receive_time_limit.end = HHmmAdd30Minutes(
      value.receive_time_limit.start,
    )
  }
  // 收货开始，结束时间相等
  if (receiveEnd.isSame(receiveStart)) {
    value.receive_time_limit.end = HHmmAdd30Minutes(
      value.receive_time_limit.start,
    )
  }

  if (receiveEnd < orderEnd) {
    value.receive_time_limit.e_span_time = value.order_time_limit.e_span_time
    value.receive_time_limit.end = value.order_time_limit.end
  }

  // 收货时间结束限制
  if (
    value.receive_time_limit.e_span_time -
      value.receive_time_limit.s_span_time >
    1
  ) {
    value.receive_time_limit.e_span_time = value.receive_time_limit.s_span_time
    value.receive_time_limit.end = value.receive_time_limit.start
  }

  // 最晚出库时间限制
  if (finalDistribute > receiveEnd) {
    value.final_distribute_time_span = value.receive_time_limit.e_span_time
    value.final_distribute_time = value.receive_time_limit.end
  }

  // 收货时间不超过24小时
  if (moment(receiveStart).add(1, 'd') < receiveEnd) {
    value.receive_time_limit.end = value.receive_time_limit.start
  }

  return value
}
// 预售可选范围
const getPreSmmRange = (smmPre) => {
  let minDairyReceiveStart = null
  let minDairyReceiveEnd = null
  let maxDairyReceiveEnd = null
  let minDistribute = null
  let maxDistribute = null
  // 当用户可选最早收货日期为当日
  if (smmPre.receive_time_limit.s_span_time === 0) {
    minDairyReceiveStart = HHmmToDate(smmPre.order_time_limit.start)
    minDistribute = HHmmToDate(smmPre.order_time_limit.end)
    // maxDistribute = HHmmToDate();
    // 如果每日收货时间截止为当日
    if (smmPre.receive_time_limit.receiveEndSpan === 0) {
      const orderEnd = HHmmToMoment(
        smmPre.order_time_limit.end,
        smmPre.order_time_limit.e_span_time,
      ) // 下单时间截止
      const receiveStart = HHmmToMoment(
        smmPre.receive_time_limit.start,
        smmPre.receive_time_limit.s_span_time,
      ) // 最早的收货时间
      minDairyReceiveEnd =
        orderEnd > receiveStart
          ? HHmmToDate(smmPre.order_time_limit.end)
          : HHmmToDate(HHmmAdd30Minutes(smmPre.receive_time_limit.start))
      maxDistribute = HHmmToDate(smmPre.receive_time_limit.end)
    } else {
      // 如果用户下单时间限制为第二天
      if (smmPre.order_time_limit.e_span_time === 1) {
        minDairyReceiveEnd = HHmmToDate(smmPre.order_time_limit.end)
      }
      if (smmPre.final_distribute_time_span === 1) {
        minDistribute = null
        maxDistribute = HHmmToDate(smmPre.receive_time_limit.end)
      }
      maxDairyReceiveEnd = HHmmToDate(smmPre.receive_time_limit.start)
    }
  } else {
    if (smmPre.receive_time_limit.receiveEndSpan === 0) {
      minDairyReceiveEnd = HHmmToDate(
        HHmmAdd30Minutes(smmPre.receive_time_limit.start),
      )
      maxDistribute = HHmmToDate(smmPre.receive_time_limit.end)
    } else {
      maxDairyReceiveEnd = HHmmToDate(smmPre.receive_time_limit.start)
      if (smmPre.final_distribute_time_span === 1) {
        maxDistribute = HHmmToDate(smmPre.receive_time_limit.end)
      }
    }
  }
  return {
    minDairyReceiveStart,
    minDairyReceiveEnd,
    maxDairyReceiveEnd,
    minDistribute,
    maxDistribute,
  }
}

export {
  getPreSmmRange,
  processState,
  preProcessState,
  HHmmToDate,
  HHmmToMoment,
  getDayList,
  HHmmAdd30Minutes,
}
