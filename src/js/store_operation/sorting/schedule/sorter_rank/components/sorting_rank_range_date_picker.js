import _ from 'lodash'
import React from 'react'
import { Select, Option, Flex } from '@gmfe/react'
import DropDownDateFilter from 'common/components/drop_down_date_filter'
import PropTypes from 'prop-types'

const SoringRankRangeDatePicker = (props) => {
  const {
    timeConfigId,
    serviceTimes,
    rangeType,
    onChangeTimeConfigId,
    onChangeRange,
    renderDate,
  } = props

  const handleFilterChange = (value) => {
    const id = value
    onChangeTimeConfigId && onChangeTimeConfigId(id)
  }

  const handleRangeChange = (dateRange) => {
    onChangeRange && onChangeRange(dateRange)
  }

  return (
    <Flex>
      <Select
        name='time_config_id'
        value={timeConfigId}
        onChange={handleFilterChange}
        className='gm-margin-right-5'
      >
        {_.map(serviceTimes, (s) => (
          <Option key={s._id} value={s._id}>
            {s.name}
          </Option>
        ))}
      </Select>
      <DropDownDateFilter
        type={rangeType}
        onChange={handleRangeChange}
        renderDate={renderDate}
      />
    </Flex>
  )
}

SoringRankRangeDatePicker.propTypes = {
  timeConfigId: PropTypes.any,
  serviceTimes: PropTypes.any,
  rangeType: PropTypes.any,
  onChangeTimeConfigId: PropTypes.func,
  onChangeRange: PropTypes.func,
  renderDate: PropTypes.func,
}

export default SoringRankRangeDatePicker
