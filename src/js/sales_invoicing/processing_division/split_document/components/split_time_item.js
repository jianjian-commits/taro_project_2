import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import { storeContext } from './details_component'
import moment from 'moment'
import { DatePicker } from '@gmfe/react'

const SplitTimeItem = () => {
  const { splitTime, setSplitTime, splitPlan, viewType } = useContext(
    storeContext
  )

  if (viewType === 'details') {
    return moment(splitTime).format('YYYY-MM-DD HH:mm:ss')
  }

  if (isNil(splitPlan)) {
    return '-'
  }

  const handleChange = (date) => {
    setSplitTime(date)
  }

  return (
    <DatePicker onChange={handleChange} date={splitTime} enabledTimeSelect />
  )
}

export default observer(SplitTimeItem)
