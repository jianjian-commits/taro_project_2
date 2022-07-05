import globalStore from 'stores/global'
import { processNavConfig } from './util'
import forB from './for_b'
import forFQT from './for_fqt'
import forSupply from './for_supply'
import forC from './for_c'
// 注意
// 1 允许存在null，方便权限的控制，在return时会过滤掉。
// 2 做好cache，没有必要每次都计算。
let navConfigCache = null

const getNavConfig = () => {
  if (navConfigCache) {
    return navConfigCache
  }

  let config

  if (globalStore.otherInfo.isCStation) {
    config = forC
  } else if (globalStore.otherInfo.isFqt) {
    config = forFQT
  } else if (globalStore.isSettleSupply()) {
    config = forSupply
  } else {
    config = forB
  }

  // 权限过滤
  navConfigCache = processNavConfig(config)

  return navConfigCache
}

export { getNavConfig }
