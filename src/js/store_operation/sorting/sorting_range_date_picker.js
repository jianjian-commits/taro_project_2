import _ from 'lodash'
import React from 'react'
import { searchDateTypes } from '../../common/enum'
import { Select, Option, Flex } from '@gmfe/react'
import { endDateRanger, startDateRanger } from '../../order/util'
import { cycleDateRangePickerInputValue } from '../../common/filter'

import CycleDateRangePicker from '../../common/components/cycle_date_range_picker'

class SoringRangeDatePicker extends React.Component {
  handleFilterChange = (value) => {
    const id = value
    const { onChangeTimeConfigId } = this.props
    onChangeTimeConfigId && onChangeTimeConfigId(id)
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

  // TODO 时间选择超过限制时，自动回到范围内
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
        begin,
        31
      )
      maxSpanEnd = _.find(serviceTimes, (s) => s._id === timeConfigId)
        .receive_time_limit.e_span_time
    }
    return (
      <Flex>
        <div className='gm-inline-block gm-margin-right-5'>
          <Select
            name='time_config_id'
            value={timeConfigId}
            onChange={this.handleFilterChange}
          >
            {_.map(serviceTimes, (s) => (
              <Option key={s._id} value={s._id}>
                {s.name}
              </Option>
            ))}
          </Select>
        </div>
        <Flex flex none>
          <CycleDateRangePicker
            begin={begin}
            end={end}
            onChange={this.handleDateChange}
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
        </Flex>
      </Flex>
    )
  }
}
export default SoringRangeDatePicker
