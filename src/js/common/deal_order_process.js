/** 处理订单流配置业务相关 */
import { t } from 'gm-i18n'
import _ from 'lodash'

import { orderTypes as orderTypeList, initOrderType } from '../common/enum'

import globalStore from '../stores/global'

// 订单类型展示
const renderOrderTypeName = (name) => {
  if (name === undefined) return '-'

  return name === ''
    ? t('常规')
    : t('order_type_name', {
        name,
      })
}

// 获取订单类型数组
const getOrderTypeList = () => {
  const { orderProcess } = globalStore.orderInfo

  const list = _.map(orderProcess, (config) => {
    // text为展示数组所需
    const text = t('order_type_name', {
      name: config.name,
    })
    return {
      ...config,
      value: config.id,
      text,
    }
  })
  // 按名字排序一下
  const data = _.sortBy(list, ({ name }) => name.toLowerCase())
  return orderTypeList.concat(data)
}

const getOrderTypeId = (orderType) => {
  // 选择默认类型，无需传id给后台，返回null
  if (orderType === initOrderType) {
    return null
  }

  // 其他类型返回选择id
  return orderType
}

export { renderOrderTypeName, getOrderTypeList, getOrderTypeId }
