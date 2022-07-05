import React from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Input, Select, DatePicker } from '@gmfe/react'
import { getCharLength } from '@gm-common/tool'
import moment from 'moment'
import {
  COMPONENT_TYPE_TEXT,
  COMPONENT_TYPE_SELECT,
  COMPONENT_TYPE_DATE,
} from '../../enum'

const Component = ({ type, value, onChange, data, disabled = false }) => {
  switch (type) {
    case COMPONENT_TYPE_TEXT:
      return (
        <Input
          className='form-control'
          value={value}
          disabled={disabled}
          onChange={(e) => {
            if (getCharLength(e.target.value) > 30) return
            return onChange(e.target.value)
          }}
          placeholder={t('请填写')}
        />
      )
    case COMPONENT_TYPE_SELECT:
      return (
        <Select
          value={value}
          data={data}
          disabled={disabled}
          onChange={onChange}
          placeholder={t('请选择')}
        />
      )
    case COMPONENT_TYPE_DATE:
      return (
        <DatePicker
          placeholder={t('请选择日期')}
          date={value && moment(value).toDate()}
          disabled={disabled}
          onChange={(date) =>
            onChange(date ? moment(date).format('YYYY-MM-DD') : '')
          }
        />
      )
  }
  return null
}

Component.propTypes = {
  type: PropTypes.oneOf(
    COMPONENT_TYPE_TEXT,
    COMPONENT_TYPE_SELECT,
    COMPONENT_TYPE_DATE,
  ).isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  data: PropTypes.array,
  disabled: PropTypes.bool,
}

export default Component
