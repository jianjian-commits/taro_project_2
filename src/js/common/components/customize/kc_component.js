import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { t } from 'gm-i18n'
import { KCInput, KCSelect, KCDatePicker } from '@gmfe/keyboard'
import {
  COMPONENT_TYPE_TEXT,
  COMPONENT_TYPE_SELECT,
  COMPONENT_TYPE_DATE,
} from '../../enum'
import { getCharLength } from '@gm-common/tool'

const KcComponent = ({ type, value, onChange, data, disabled = false }) => {
  switch (type) {
    case COMPONENT_TYPE_TEXT:
      return (
        <KCInput
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
        <KCSelect
          value={value}
          data={data}
          onChange={onChange}
          disabled={disabled}
          placeholder={t('请选择')}
        />
      )
    case COMPONENT_TYPE_DATE:
      return (
        <KCDatePicker
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

KcComponent.propTypes = {
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

export default KcComponent
