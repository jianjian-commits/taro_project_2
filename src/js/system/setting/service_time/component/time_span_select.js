import React from 'react'
import PropTypes from 'prop-types'
import { Select } from '@gmfe/react'
import { SERVICE_TIME_TYPE } from '../../../../common/enum'

const TimeSpanSelect = (props) => {
  return (
    <Select {...props} data={SERVICE_TIME_TYPE} style={{ width: '80px' }} />
  )
}

TimeSpanSelect.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default TimeSpanSelect
