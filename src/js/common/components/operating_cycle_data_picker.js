import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { searchDateTypes } from '../../common/enum'
import { endDateRanger, startDateRanger } from '../util'
import { cycleDateRangePickerInputValue } from '../filter'

import SelectDateFilter from 'common/components/date_range_filter/select_date_filter'

class OperatingCycleDataPicker extends React.Component {
  handleFilterChange = (value) => {
    const { onChangeTimeConfigId } = this.props
    onChangeTimeConfigId && onChangeTimeConfigId(value)
  }

  handleDateChange = (begin, end) => {
    const { onChangeDate } = this.props
    onChangeDate && onChangeDate(begin, end)
  }

  renderDateRangePickerInputValue = (date) => {
    const { serviceTimes, timeConfigId } = this.props
    const time = _.find(serviceTimes, (v) => v._id === timeConfigId)
    return cycleDateRangePickerInputValue(date, time)
  }

  render() {
    const dateType = searchDateTypes.CYCLE.type
    const { serviceTimes, timeConfigId, end, begin } = this.props
    let maxEndConfig = {}
    let endProps = {}
    let maxSpanEnd = {}
    if (serviceTimes.length && timeConfigId) {
      maxEndConfig = _.maxBy(
        serviceTimes,
        (serivceTime) => serivceTime.receive_time_limit.e_span_time
      )
      endProps = endDateRanger(
        dateType,
        maxEndConfig &&
          maxEndConfig.receive_time_limit &&
          maxEndConfig.receive_time_limit.e_span_time,
        begin
      )
      maxSpanEnd = _.find(serviceTimes, (s) => s._id === timeConfigId)
        .receive_time_limit.e_span_time
    }
    return (
      <SelectDateFilter
        time_config_id={timeConfigId}
        service_times={serviceTimes}
        begin={begin}
        end={end}
        onChange={this.handleDateChange}
        onSecondSelectChange={this.handleFilterChange}
        renderBeginDate={this.renderDateRangePickerInputValue}
        renderEndDate={this.renderDateRangePickerInputValue}
        beginProps={{
          max: startDateRanger(dateType, maxSpanEnd, begin).max,
        }}
        endProps={{
          min: endProps.min,
          max: endProps.max,
        }}
      />
    )
  }
}

OperatingCycleDataPicker.propTypes = {
  serviceTimes: PropTypes.array,
  begin: PropTypes.object,
  end: PropTypes.object,
  timeConfigId: PropTypes.string,
  onChangeTimeConfigId: PropTypes.func,
  onChangeDate: PropTypes.func,
}
export default OperatingCycleDataPicker
