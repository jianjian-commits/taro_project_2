import { t } from 'gm-i18n'
import { isCStationAndC } from 'common/service'

const dailySectionName = () => {
  if (isCStationAndC()) {
    return t('猜你喜欢')
  }
  return t('每日精选')
}

const diyShopInfo = () => {
  if (isCStationAndC()) {
    return t(
      '提示：点击模块进行编辑，支持添加广告位模块；左侧页面区域仅作为示例图展示，真实效果请参考商城上架效果。'
    )
  }
  return t(
    '提示：点击模块进行编辑，支持添加广告位和商品组模块；左侧页面区域仅作为示例图展示，真实效果请参考商城上架效果。'
  )
}

const showDailyInfo = () => {
  if (isCStationAndC()) {
    return t('随机展示商品库中的26个商品')
  }
  return t(
    '随机展示全部营销活动中的商品；若无营销活动，将随机展示商户绑定报价单中的10个商品'
  )
}

export { dailySectionName, diyShopInfo, showDailyInfo }
