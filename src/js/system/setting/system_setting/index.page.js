import React, { useEffect, useMemo } from 'react'
import { FullTab } from '@gmfe/frame'
import { t } from 'gm-i18n'
import MerchandiseSetting from './merchandise_setting'
import SalesInvoicingSetting from './sales_invoicing_setting'
import ShopSetting from './shop_setting'
import SortingSetting from './sorting_setting'
import DriverSetting from './driver_setting'
import PurchasingSetting from './purchasing_setting'
import OrderSetting from './order_setting/index'
import FullScreenSetting from './full_screen_setting'
import TurnoverSetting from './turnover_setting'
import store from './store'
import { observer } from 'mobx-react'

import { settingTabsMap } from './util'
import globalStore from 'stores/global'
import ProcessSetting from './process_setting'

const SystemSetting = observer((props) => {
  const { activeTab } = store
  const { isCStation } = globalStore.otherInfo
  const p_merchandise = globalStore.hasPermission('get_merchandise_setting')
  const p_bshop = globalStore.hasPermission('get_bshop_setting')
  const p_order = globalStore.hasPermission('get_order_setting')
  const p_sorting = globalStore.hasPermission('get_sorting_setting')
  const p_distribute = globalStore.hasPermission('get_distribute_setting')
  const p_stock = globalStore.hasPermission('get_stock_setting')
  const p_cast = globalStore.hasPermission('get_cast_setting')
  const p_process = globalStore.hasPermission('get_process_setting')
  const p_turnover = globalStore.hasPermission('view_turnover_setting')
  const p_purchasing = globalStore.hasPermission('get_purchase_setting') // 默认给true
  // const p_purchasing = true // 默认给true

  const tabs = useMemo(() => {
    // 系统设置模块
    const settingTabsOfBStation = [
      p_merchandise && t('商品设置'),
      p_bshop && t('商城设置'),
      p_order && t('订单设置'),
      p_sorting && t('分拣设置'),
      p_distribute && t('配送设置'),
      p_purchasing && t('采购设置'), // 新增
      p_stock && t('进销存设置'),
      p_cast && t('投屏设置'),
      p_turnover && t('周转物设置'),
      globalStore.isCleanFood() && p_process && t('加工设置'),
    ]

    // toc还是分开吧
    const settingTabsOfCStation = [
      p_merchandise && t('商品设置'),
      p_sorting && t('分拣设置'),
      p_distribute && t('配送设置'),
      p_purchasing && t('采购设置'), // 新增
      p_stock && t('进销存设置'),
      p_cast && t('投屏设置'),
      p_cast && t('投屏设置'),
    ]
    let result = settingTabsOfBStation
    if (isCStation) {
      result = settingTabsOfCStation
    }
    return result.filter((v) => v)
  }, [isCStation]) // 由于tabs会影响当前active tab,还是做一层memo好点

  useEffect(() => {
    const { activeType } = props.location.query
    if (activeType) {
      const index = tabs.findIndex((v) => v === settingTabsMap[activeType])
      store.setActiveType(index)
    }
  }, [tabs])

  const handleChangeTab = (index) => {
    store.setActiveType(index)
  }

  // 修改tab时请留意useEffect的使用，这里需要跳转到对应tab，所以修改tab顺序的时候需要扫一下用到的地方做相应修改
  return (
    <FullTab active={+activeTab} onChange={handleChangeTab} tabs={tabs}>
      {p_merchandise && <MerchandiseSetting />}
      {p_bshop && !isCStation && <ShopSetting />}
      {p_order && !isCStation && <OrderSetting />}
      {p_sorting && <SortingSetting />}
      {p_distribute && <DriverSetting />}
      {p_purchasing && <PurchasingSetting />}
      {p_stock && <SalesInvoicingSetting />}
      {p_cast && <FullScreenSetting />}
      {p_turnover && <TurnoverSetting />}
      {globalStore.isCleanFood() && p_process && <ProcessSetting />}
    </FullTab>
  )
})

export default SystemSetting
