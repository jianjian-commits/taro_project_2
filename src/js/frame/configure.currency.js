import { Price } from '@gmfe/react'
const list = [
  { symbol: '$', type: 'HKD', unit: '港元' },
  { symbol: 'MOP$', type: 'MOP', unit: '澳门元' },
]
Price.setCurrencyList(list) // 同站多币种列表
