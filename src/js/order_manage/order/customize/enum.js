import { t } from 'gm-i18n'
import {
  CONFIG_ORDER_HEADER,
  CONFIG_ORDER_DETAIL,
  COMPONENT_TYPE_TEXT,
  COMPONENT_TYPE_SELECT,
  COMPONENT_TYPE_DATE,
} from 'common/enum'
console.log(CONFIG_ORDER_HEADER, CONFIG_ORDER_DETAIL)
function formatMap(list) {
  const map = {}
  list.forEach((v) => {
    map[v.value] = v.text
  })
  return map
}

export const belongType = [
  { value: CONFIG_ORDER_HEADER, text: t('订单') },
  { value: CONFIG_ORDER_DETAIL, text: t('订单明细') },
]

export const fieldType = [
  { value: COMPONENT_TYPE_TEXT, text: t('文本') },
  { value: COMPONENT_TYPE_SELECT, text: t('单选') },
  { value: COMPONENT_TYPE_DATE, text: t('日期') },
]

export const belongTypeMap = formatMap(belongType)

export const fieldTypeMap = formatMap(fieldType)
