import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import orderDetailStore from '../../store'

import { isOrderTimeValid, isNoAvailReceiveTime } from '../../util'

const ServiceTimeError = observer((props) => {
  const { repair } = props
  const { orderDetail } = orderDetailStore
  const {
    viewType,
    customer,
    serviceTimes,
    time_config_info,
    currentTime,
    serviceTimesLoading,
    date_time,
  } = orderDetail

  if (serviceTimesLoading) {
    return null
  } else if (
    viewType === 'create' &&
    customer &&
    serviceTimes &&
    !serviceTimes.length
  ) {
    return (
      <span className='gm-text-red'>
        &nbsp;&nbsp;{i18next.t('商户未绑定有效报价单')}
      </span>
    )
  } else if (time_config_info && time_config_info.order_time_limit) {
    const {
      start,
      end,
      e_span_time,
      s_span_time,
    } = time_config_info.order_time_limit

    if (
      !repair &&
      !isOrderTimeValid(
        viewType,
        currentTime,
        start,
        end,
        e_span_time,
        s_span_time
      )
    ) {
      return (
        <span className='gm-text-red'>
          &nbsp;&nbsp;{i18next.t('当前时间无法下单')}
        </span>
      )
    }
    if (
      viewType !== 'view' &&
      !repair &&
      isNoAvailReceiveTime(time_config_info, date_time)
    ) {
      return (
        <span className='gm-text-red'>
          &nbsp;&nbsp;{i18next.t('无可用收货时间')}
        </span>
      )
    }
  }
  return null
})

ServiceTimeError.displayName = 'ServiceTimeError'

ServiceTimeError.propTypes = {
  repair: PropTypes.bool,
  orderDetail: PropTypes.object,
}

export default ServiceTimeError
