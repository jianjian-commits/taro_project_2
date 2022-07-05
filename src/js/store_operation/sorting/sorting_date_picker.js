import _ from 'lodash'
import React from 'react'
import { DatePicker, Select, Option, Flex } from '@gmfe/react'
import { cycleDateRangePickerInputValue } from '../../common/filter'

class SoringDatePicker extends React.Component {
  constructor(props) {
    super(props)

    this.handleFilterChange = ::this.handleFilterChange
    this.handleDateChange = ::this.handleDateChange
    this.renderDateRangePickerInputValue =
      ::this.renderDateRangePickerInputValue
  }

  handleFilterChange(value) {
    const id = value
    const { onChangeTimeConfigId } = this.props
    onChangeTimeConfigId && onChangeTimeConfigId(id)
  }

  handleDateChange(begin, end) {
    const { onChangeDate } = this.props
    onChangeDate && onChangeDate(begin, end)
  }

  renderDateRangePickerInputValue(date) {
    const { serviceTimes, timeConfigId } = this.props
    const time = _.find(serviceTimes, (v) => v._id === timeConfigId)
    return cycleDateRangePickerInputValue(date, time)
  }

  render() {
    const { serviceTimes, timeConfigId, date } = this.props

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
        <Flex flex none column>
          <DatePicker
            disabledClose
            date={date}
            onChange={this.handleDateChange}
            renderDate={this.renderDateRangePickerInputValue}
          />
        </Flex>
      </Flex>
    )
  }
}
export default SoringDatePicker
