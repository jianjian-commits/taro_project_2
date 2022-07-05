import { t } from 'gm-i18n'
import _ from 'lodash'
import { isNumber } from 'common/util'

export function technologyNames(tasks) {
  return (tasks.map((t) => t.technic_flow_name || t.technic_name) || []).join(
    '-'
  )
}

export function technicFlowCustomCols(list) {
  if (!list.length) {
    return '-'
  }
  return list
    .map((v) => `${v.technic_flow_col_name}(${v.technic_flow_param_name})`)
    .join('，')
}

//  商品类型
export const remarkType = (type) => {
  switch (type + '') {
    case '1':
      return t('原料')
    case '2':
      return t('净菜')
    case '3':
      return t('便当')
    case '4':
      return t('组合商品')
    case '5':
      return t('餐具')
    case '6':
      return t('包装材料')
    case '7':
      return t('毛菜')
    default:
      return ''
  }
}

export const handleValidator = (data) => {
  const newData = _.filter(data.slice(), (i) => i.task_id !== null)
  const attr = _.filter(newData, (i) => {
    if (i.recv_amount !== '-' && isNumber(i.recv_amount)) {
      return true
    }
    if (i.output_amount !== '-' && isNumber(i.output_amount)) {
      return true
    }
    return false
  })
  return attr.length >= 1
}

export const getValueToPost = (value) => {
  return value === '-' || (!value && value !== 0)
    ? undefined
    : _.toNumber(value)
}

export const PROCESS_RECEIPT_STATUS = [
  { value: 0, text: t('全部状态') },
  { value: 2, text: t('未开工') },
  { value: 3, text: t('已完成') },
  { value: 4, text: t('已开工') },
]
