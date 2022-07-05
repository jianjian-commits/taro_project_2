import React from 'react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { DatePicker } from '@gmfe/react'
import { observer } from 'mobx-react'
import orderStore from '../../store'

const SettlementTime = observer((props) => {
  const { viewType, settlement_time, time_config_info } = orderStore.orderDetail

  const disabled = !time_config_info
  const disabledDate = (date) => {
    return !(
      moment(date) < moment().add(6, 'month') &&
      moment(date) > moment().add(-6, 'month')
    )
  }

  const handleChange = (date) => {
    orderStore.receiveChange({ settlement_time: date })
  }

  if (viewType === 'view') {
    return settlement_time ? moment(settlement_time).format('YYYY-MM-DD') : '-'
  }
  return (
    <DatePicker
      date={
        orderStore.settlementTime
          ? moment(orderStore.settlementTime).toDate()
          : null
      }
      onChange={handleChange}
      disabled={disabled}
      disabledDate={disabledDate}
      placeholder={t('结款时间')}
      disabledClose
    />
  )
})

export default SettlementTime
