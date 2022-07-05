import React, { useState, useEffect } from 'react'
import { Framework, RightTop } from '@gmfe/frame'
import { Price } from '@gmfe/react'
import { getNavConfig } from './navigation'
import actions from './actions'
import {
  withRouter,
  isFullScreen,
  arrearsTip,
  cyclePriceWarning,
} from './common/service'
import { setIco } from '@gm-common/tool'
import Task from './task/task'
import KF from './app/kf'
import Info from './app/info'
import stockWarning from './stock_warning'
import Warning from './upgrade_warning'
import globalStaticResourceStore from './stores/global_static_resource'
import { setAppTitle } from './app/util'
import { Menu, ComBreadcrumb } from './app/component'
import globalStore from './stores/global'
import { observer } from 'mobx-react'
import bridge from './bridge'
import weightStore from './stores/weight'
import PageTip from './app/page_tip'
import { gioUserGroupInfo, gioPage } from './common/gio'

// connect 的约细越好，这样不用经常 render
const App = withRouter(
  observer((props) => {
    const {
      location: { pathname, search },
      children,
    } = props

    // 当跳转页面为二级页面时，进行打点
    useEffect(() => {
      gioPage(pathname)
    }, [pathname])

    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const handleMenuClick = () => {
      setShowMobileMenu(!showMobileMenu)
    }

    const handleMenuClose = () => {
      setShowMobileMenu(false)
    }

    useEffect(() => {
      setAppTitle(pathname, globalStore.breadcrumbs.slice(), getNavConfig())
    }, [pathname, JSON.stringify(globalStore.breadcrumbs.slice())])

    useEffect(() => {
      globalStore.fetchLogo().then(() => {
        setIco(globalStore.logo.ico)
      })
      globalStore.fetchCurrency().then((currencyConfig) => {
        const { currency, unit } = currencyConfig
        Price.setCurrency(currency)
        Price.setUnit(unit)
      })

      // 上报用户信息到GIO
      gioUserGroupInfo()

      // 获取商品库销售计量单位
      globalStore.fetchMeasurementUnitList()
      // 获取净菜加工计量单位
      if (globalStore.isCleanFood()) {
        globalStore.fetchProcessUnitList()
      }

      // 不紧急，延迟
      setTimeout(() => {
        // 获取域名配置
        globalStaticResourceStore.fetchData()

        // 获取商品库unit_name
        actions.global_get_unit_name()
        globalStore.fetchUnitName()

        // iframe 不做库存预警功能
        if (window.parent === window) {
          stockWarning()
        }

        arrearsTip()

        // 周期定价规则导入异常
        cyclePriceWarning(pathname)

        // 获取店铺信息，展示在 top
        globalStore.otherInfo.authority.role !== 6 && !globalStore.otherInfo.isCStation && globalStore.fetchBShop()
      }, 2000)

      globalStore.getGroundWeightInfo().then(() => {
        if (
          globalStore.groundWeightInfo.weigh_stock_in ||
          globalStore.groundWeightInfo.weigh_check
        ) {
          // 初始化串口, 不急，3s 后在初始化
          if (bridge.weight) {
            bridge.mes_app.isInstalledChromeMesApp()
            setTimeout(() => {
              bridge.mes_app.getWeightData()
              weightStore.start()
            }, 3000)
          }
        }
      })

      // 获取订单配置信息
      globalStore.getOrderProcessInfo()
    }, [])

    useEffect(() => {
      if (bridge.weight) {
        return () => bridge.mes_app.disconnectWeight()
      }
    }, [])

    return (
      <Framework
        showMobileMenu={showMobileMenu}
        isFullScreen={isFullScreen(pathname)}
        menu={<Menu onClose={handleMenuClose} />}
        rightTop={
          <RightTop
            breadcrumb={<ComBreadcrumb />}
            info={<Info />}
            onMenuBtnClick={handleMenuClick}
          />
        }
        leftWidth='60px'
      >
        <PageTip />
        {React.cloneElement(children, {
          key: pathname + search,
        })}
        <Warning />
        {pathname.indexOf('full_screen') === -1 && <Task />}
        {pathname.indexOf('full_screen') === -1 && <KF />}
      </Framework>
    )
  })
)

export default App
