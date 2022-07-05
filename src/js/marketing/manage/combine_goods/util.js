import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { Tip } from '@gmfe/react'

/**
 * 销售状态
 * @param state int
 */
export const saleState = (state) =>
  [i18next.t('下架'), i18next.t('上架')][state] || '-'

/**
 * 组合商品类型 combine_level
 */
export const combineLevel = {
  2: i18next.t('二级组合商品'),
  3: i18next.t('三级组合商品'),
}

/**
 * 用逗号连接多个可见报价单
 * @param data [ { salemenu_id: string, salemenu_name: string } ]
 */
export const showMultipleSaleMenus = (data) => {
  return _.map(data, (item) => {
    return item.salemenu_name
  }).join('，')
}

/**
 * 自动提示
 * @param list [ { warning: string, isValid: bool } ]
 */
export const autoWarning = (list) => {
  _.each(list, (item) => {
    if (!item.isValid) {
      Tip.warning(item.warning)
    }
  })
}

/**
 * 数组合并去重
 * @param arr1 arr2
 * arr1 添加报价单 [ { value: string, text: string }]
 * arr2 已有报价单 [ { value: string, text: string, isExit: bool } ]
 */
export const mergeRemoveRepeatArray = (arr1, arr2) => {
  const noRepeatArray = _.filter(
    arr1,
    // 返回 添加报价单中不在已有报价单的值
    (item) =>
      !_.some(arr2, (o) => o.value === item.value && o.text === item.text)
  )
  return [...noRepeatArray, ...arr2]
}

export const imgUrlToId = (images) => {
  return _.map(images, (img) => {
    const arr = img.split('/')
    return arr[arr.length - 1]
  })
}
