import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import classNames from 'classnames'

import { Select, DateRangePicker, FormItem, Flex } from '@gmfe/react'
import { cycleDateRangePickerInputValue } from '../../../common/filter'
import SelectDateFilter from './select_date_filter'

class DateFilter extends React.Component {
  renderDateRangePickerInputValue = (date) => {
    const { filter, data } = this.props
    const time = _.find(
      data.service_times,
      (v) => v._id === filter.time_config_id,
    )
    return cycleDateRangePickerInputValue(date, time)
  }

  handleFirstSelectChange = (value) => {
    const result = { dateType: value }
    this.props.onDateFilterChange(result)
  }

  handleSecondSelectChange = (value) => {
    const result = { time_config_id: value }
    this.props.onDateFilterChange(result)
  }

  handleDateChange = (begin, end) => {
    const result = { begin: begin, end: end }
    this.props.onDateFilterChange(result)
  }

  getCycleDateLimit = (dataNum, type) => {
    const { limitDates } = this.props
    if (!(limitDates && limitDates[dataNum])) {
      return undefined
    }
    const limits = limitDates[dataNum]()
    if (type === 'begin') {
      return limits.beginProps
    } else {
      return limits.endProps
    }
  }

  render() {
    const {
      data,
      filter,
      className,
      limitDates,
      enabledTimeSelect,
      ...rest
    } = this.props
    const { begin, end, dateType, time_config_id } = filter
    const { dateFilterData, service_times } = data
    let datePart = null
    const target = _.find(dateFilterData, (item) => {
      return item.type === dateType
    })
    const dataNum = _.findIndex(dateFilterData, (item) => {
      return item.type === dateType
    })
    if (target && target.expand) {
      datePart = (
        <SelectDateFilter
          time_config_id={time_config_id}
          service_times={service_times}
          begin={begin}
          end={end}
          onChange={this.handleDateChange}
          onSecondSelectChange={this.handleSecondSelectChange}
          renderBeginDate={this.renderDateRangePickerInputValue}
          renderEndDate={this.renderDateRangePickerInputValue}
          beginProps={this.getCycleDateLimit(dataNum, 'begin')}
          endProps={this.getCycleDateLimit(dataNum, 'end')}
        />
      )
    } else {
      datePart = (
        <DateRangePicker
          begin={begin}
          end={end}
          onChange={this.handleDateChange}
          disabledDate={(limitDates && limitDates[dataNum]) || undefined}
          enabledTimeSelect={enabledTimeSelect}
        />
      )
    }

    return (
      <FormItem
        {...rest}
        className={classNames('', className)}
        col={target.expand ? 2 : 1}
      >
        <Flex>
          <div className='gm-inline-block gm-padding-right-5'>
            <Select
              clean
              name='FirstSelect'
              value={dateType}
              onChange={this.handleFirstSelectChange}
              className='gm-inline-block'
              style={{ width: 95 }}
              data={_.map(dateFilterData, (date_type) => ({
                value: date_type.type,
                text: date_type.name,
              }))}
            />
          </div>
          <Flex
            flex
            none
            column
            style={{ minWidth: enabledTimeSelect ? 280 : 'auto' }}
          >
            {datePart}
          </Flex>
        </Flex>
      </FormItem>
    )
  }
}

DateFilter.propTypes = {
  /* ???????????? { dateFilterData: [],service_times: []} */
  data: PropTypes.object,
  /* ????????????????????????????????? {dateType: value}, {time_config_id: value} ,{begin: value, end: value} */
  onDateFilterChange: PropTypes.func,
  /* ???????????????,??????begin, end, dateType, time_config_id????????? */
  filter: PropTypes.object,
  /** ????????????????????????????????????????????????
   * ????????????????????????????????? null
   * ?????????????????? ?????????????????? true or false, ???????????????????????????????????????????????????{ beginProps, endProps}
   * beginProps && endProps??????????????????: { max, min, disabledDate } ==> { object, object, func}
   */
  limitDates: PropTypes.array,

  className: PropTypes.string,
  // ???????????????????????????????????????
  enabledTimeSelect: PropTypes.bool,
}

DateFilter.defaultProps = {
  enabledTimeSelect: false,
}

export default DateFilter
