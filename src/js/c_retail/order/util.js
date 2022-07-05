import { t } from 'gm-i18n'
import _ from 'lodash'
import { Price } from '@gmfe/react'
import Big from 'big.js'

// 订单列表日期搜索条件
const COrderDateFilter = [
  {
    type: '1',
    name: '按下单日期'
  },
  {
    type: '3',
    name: '按收货日期'
  }
]

// 退款状态
const refundStatusFliter = [
  { value: -1, text: t('全部') },
  { value: 4, text: t('待处理') },
  { value: 1, text: t('退款中') },
  { value: 2, text: t('退款成功') },
  { value: 3, text: t('退款失败') }
]

// toc订单查看 -- 搜索类型
const ORDER_SEARCH_TYPE = [
  { value: 1, text: t('按订单/客户') },
  { value: 2, text: t('按订单号') },
  { value: 3, text: t('按客户') },
  { value: 4, text: t('按订单备注') }
]

// 订单列表头部搜索类型
const searchText = [
  '',
  t('输入订单号、客户信息搜索'),
  t('输入订单号搜索'),
  t('输入客户信息搜索'),
  t('输入订单备注信息搜索')
]

// 处理select数据为{ text, value }
const getSelectData = list => {
  return _.map(list, s => ({
    ...s,
    text: s.name,
    value: s.id !== undefined ? s.id : s.value
  }))
}

// 金额展示
const getPrice = (order, type) => {
  return (
    Big(order[type] || 0)
      .div(100)
      .toFixed(2) + Price.getUnit(order.fee_type)
  )
}

export {
  COrderDateFilter,
  refundStatusFliter,
  getSelectData,
  getPrice,
  searchText,
  ORDER_SEARCH_TYPE
}
