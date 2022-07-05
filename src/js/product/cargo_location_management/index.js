import React from 'react'
import { i18next } from 'gm-i18n'
import { FullTab } from '@gmfe/frame'
import SearchByStock from './search_by_cargo'
import SearchByProduct from './search_by_product'
import globalStore from '../../stores/global'

const permission = !globalStore.otherInfo.cleanFood

export default function StockManagement() {
  // 净菜暂时隐藏商品部分
  const tabs = [i18next.t('按货位查询')]
  if (permission) {
    tabs.push(i18next.t('按商品查询'))
  }

  return (
    <FullTab tabs={tabs}>
      <SearchByStock />
      {permission && <SearchByProduct />}
    </FullTab>
  )
}
