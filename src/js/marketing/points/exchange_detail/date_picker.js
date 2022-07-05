import React, { Component } from 'react'
import { DateRangePicker } from '@gmfe/react'
import _ from 'lodash'
import { endDateRanger } from '../../../order/util'
import { cycleDateRangePickerInputValue } from 'common/filter'
import store from './store'
import { observer } from 'mobx-react'
import moment from 'moment'

import CycleDateRangePicker from 'common/components/cycle_date_range_picker'

@observer
class Datepicker extends Component {
  handleDateChange(begin, end) {
    store.setFilterDate(begin, end)
  }

  renderDateRangePickerInputValue(date) {
    const { serviceTime, filter } = store
    const time = _.find(serviceTime, (v) => v._id === filter.time_config_id)

    return cycleDateRangePickerInputValue(date, time)
  }

  render() {
    const { filter, serviceTime } = store
    const { dateType, begin, end, time_config_id } = filter

    const maxEndConfig = _.maxBy(
      serviceTime,
      (serviceTime) => serviceTime.receive_time_limit.e_span_time
    )

    const endProps = endDateRanger(
      dateType,
      maxEndConfig &&
        maxEndConfig.receive_time_limit &&
        maxEndConfig.receive_time_limit.e_span_time,
      begin
    )

    let maxSpanEnd = null

    // 按运营周期
    if (dateType === '2') {
      const currentServiceTime = _.find(
        serviceTime,
        (s) => s._id === time_config_id
      )
      maxSpanEnd =
        currentServiceTime && currentServiceTime.receive_time_limit.e_span_time
    }

    if (dateType === '1' || dateType === '3') {
      return (
        <DateRangePicker
          begin={begin}
          end={end}
          onChange={this.handleDateChange}
          max={endProps.max}
        />
      )
    }

    return (
      <div className='gm-inline-block gm-margin-right-5'>
        <div className='gm-inline-block gm-margin-right-5'>
          <select
            name='time_config_id'
            value={time_config_id}
            onChange={(e) => store.setFilter('time_config_id', e.target.value)}
            className='form-control'
          >
            {_.map(serviceTime, (s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <CycleDateRangePicker
          begin={begin}
          end={end}
          onChange={this.handleDateChange}
          renderBeginDate={this.renderDateRangePickerInputValue}
          renderEndDate={this.renderDateRangePickerInputValue}
          beginProps={{
            max: moment().add(maxSpanEnd, 'd'),
          }}
          endProps={{
            min: endProps.min,
            max: endProps.max,
          }}
        />
      </div>
    )
  }
}

export default Datepicker
