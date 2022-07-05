/**
 * @description 周期定价列表
 * @path 报价单管理-报价单-更多功能
 *       商品库-更多功能
 */
import React, { useEffect } from 'react'

import { i18next } from 'gm-i18n'

import { WithBreadCrumbs } from 'common/service'

import CyclePriceFilter from './components/cycle_price_filter'
import CyclePriceList from './components/cycle_price_list'
import store from './store'

function CyclePricing(props) {
  const { salemenu_id, salemenu_name, rule_id } = props.location.query

  useEffect(() => {
    store.getSalemenuList()
    store.filterChange({
      salemenu_id: salemenu_id || '',
      salemenu_name: salemenu_name || '',
      rule_id: rule_id || '',
    })
  }, [salemenu_id, salemenu_name, rule_id])

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[i18next.t('周期定价列表')]} />
      <CyclePriceFilter />
      <CyclePriceList />
    </>
  )
}

export default CyclePricing
