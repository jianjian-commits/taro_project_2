import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import {
  DatePicker,
  DateRangePicker,
  Flex,
  FormItem,
  Select,
} from '@gmfe/react'
import { Request } from '@gm-common/request'
import { cycleDateRangePickerInputValue } from 'common/filter'

class OutboundRecordDate extends Component {
  static propTypes = {
    timeTypeMap: PropTypes.object,
    onChange: PropTypes.func,
  }

  state = {
    serviceTime: [],
    time_type: 2,
    time_config_id: null,
    begin: new Date(),
    end: new Date(),
  }

  componentDidMount() {
    this._init().then()
  }

  async _init() {
    const { data } = await Request('/service_time/list').get()
    const [{ _id }] = data
    this.setState({ serviceTime: data, time_config_id: _id }, () => {
      const { onChange } = this.props
      const { serviceTime, ...rest } = this.state
      onChange(rest)
    })
  }

  handleChange = (value) => {
    this.setState(value, () => {
      const { serviceTime, ...rest } = this.state
      const { onChange } = this.props
      onChange && onChange(rest)
    })
  }

  _renderDate = () => {
    const { time_config_id, begin, end } = this.state
    const { serviceTime } = this.state
    return (
      <Flex>
        <Select
          className='gm-margin-left-10'
          onChange={(value) => this.handleChange({ time_config_id: value })}
          data={serviceTime.map((item) => ({
            value: item._id,
            text: item.name,
          }))}
          value={time_config_id}
        />
        <Flex alignCenter>
          <span className='gm-padding-lr-10'>{t('起始周期')}</span>
          <DatePicker
            date={begin}
            style={{ minWidth: '260px' }}
            onChange={(begin) => this.handleChange({ begin })}
            renderDate={this._renderDateRangePickerInputValue}
          />
          <span className='gm-padding-lr-10'>{t('截止周期')}</span>
          <DatePicker
            date={end}
            style={{ minWidth: '260px' }}
            onChange={(end) => this.handleChange({ end })}
            renderDate={this._renderDateRangePickerInputValue}
          />
        </Flex>
      </Flex>
    )
  }

  _renderDateRangePickerInputValue = (date) => {
    const { serviceTime, time_config_id } = this.state
    const time = serviceTime.find((item) => item._id === time_config_id)
    return cycleDateRangePickerInputValue(date, time)
  }

  render() {
    const { time_type, begin, end } = this.state
    const { timeTypeMap } = this.props
    const timeTypeList = Object.entries(timeTypeMap).map(([key, value]) => ({
      value: parseInt(key),
      text: value,
    }))
    return (
      <FormItem col={time_type === 3 ? 3 : 1}>
        <Flex>
          <Select
            onChange={(value) => this.handleChange({ time_type: value })}
            data={timeTypeList}
            value={time_type}
            clean
          />
          <Flex flex column>
            {time_type === 3 ? (
              this._renderDate()
            ) : (
              <DateRangePicker
                begin={begin}
                end={end}
                onChange={(begin, end) => this.handleChange({ begin, end })}
              />
            )}
          </Flex>
        </Flex>
      </FormItem>
    )
  }
}

export default OutboundRecordDate
