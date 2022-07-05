import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Select } from '@gmfe/react'
import { getDayList } from '../util'

class DaySelect extends React.Component {
  render() {
    const { days, className, ...rest } = this.props

    let newDays = days

    if (this.props.min !== undefined) {
      newDays = days.slice(this.props.min)
    }
    if (this.props.max !== undefined) {
      newDays = days.slice(0, this.props.max)
    }
    if (this.props.min !== undefined && this.props.max !== undefined) {
      newDays = days.slice(this.props.min, this.props.max)
    }

    const newData = _.map(newDays, (day) => ({
      value: day.id,
      text: day.text,
    }))

    return <Select {...rest} data={newData} style={{ width: '80px' }} />
  }
}

DaySelect.propTypes = {
  days: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
}

DaySelect.defaultProps = {
  days: getDayList(),
}

export default DaySelect
