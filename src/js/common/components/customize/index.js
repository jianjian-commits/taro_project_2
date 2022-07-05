import moment from 'moment'
import _ from 'lodash'
import {
  COMPONENT_TYPE_TEXT,
  COMPONENT_TYPE_SELECT,
  COMPONENT_TYPE_DATE,
} from '../../enum'
import Component from './component'
import KcComponent from './kc_component'

function getFiledData(config, customized_field) {
  if (!customized_field) return '-'
  const value = customized_field[config.id]
  switch (config.field_type) {
    case COMPONENT_TYPE_TEXT:
      return value || '-'
    case COMPONENT_TYPE_SELECT:
      return _.find(config.radio_list, (v) => v.id === value)?.name || '-'
    case COMPONENT_TYPE_DATE:
      return value ? moment(value).format('YYYY-MM-DD') : '-'
  }
  return '-'
}

export { Component as Customize, KcComponent as KcCustomize, getFiledData }
