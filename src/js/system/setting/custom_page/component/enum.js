import { i18next } from 'gm-i18n'
import _ from 'lodash'
const displayWidth = 370

const tabSize = {
  small: 'small',
  middle: 'medium',
  big: 'large',
}

const moduleType = {
  ad: 'ad',
  sku: 'sku_groups',
  coupon: 'coupon',
  flashSale: 'flash_sale',
}

const adLayoutType = {
  one: 1,
  two: 2,
  three: 3,
}

const skuLayoutType = {
  list: 'list',
  across: 'tiled',
}

const getDefaultSkuGroups = (extend) => {
  // 允许覆盖的配置
  extend = _.pick(extend, 'title', 'show_type')

  const skuDefault = {
    category: moduleType.sku,
    title: '',
    promotion_id: '',
    error: { name: '', sku: '' },
    show_type: skuLayoutType.across,
    skus: [
      {
        img_url: '',
        name: i18next.t('商品名称'),
        desc: i18next.t('商品描述'),
      },
      {
        img_url: '',
        name: i18next.t('商品名称'),
        desc: i18next.t('商品描述'),
      },
    ],
  }
  return _.merge(skuDefault, extend)
}

const getDefaultAds = (extend) => {
  // 允许覆盖的配置
  extend = _.pick(extend, 'type', 'ad_imgs_with_url')

  const adDefault = {
    category: moduleType.ad,
    type: adLayoutType.one,
    error: { msg: '' },
    ad_imgs_with_url: [
      {
        img_url: '',
        url: '',
        img_id: '',
      },
      {
        img_url: '',
        url: '',
        img_id: '',
      },
      {
        img_url: '',
        url: '',
        img_id: '',
      },
    ],
  }
  return _.merge(adDefault, extend)
}

const getDefaultCoupon = () => {
  const couponDefault = {
    category: moduleType.coupon,
  }
  return couponDefault
}

const getDefaultFlashSale = () => {
  const flashSaleDefault = {
    category: moduleType.flashSale,
  }
  return flashSaleDefault
}

const moduleDefaultBuilder = {
  ad: getDefaultAds,
  sku_groups: getDefaultSkuGroups,
  coupon: getDefaultCoupon,
  flash_sale: getDefaultFlashSale,
}

const createModule = (type, extend) => {
  const builder = moduleDefaultBuilder[type]
  return builder(extend)
}

const LabelName = {
  FAV: i18next.t('我的收藏'),
  COMBINE: i18next.t('组合商品'),
}

export {
  tabSize,
  moduleType,
  adLayoutType,
  skuLayoutType,
  getDefaultSkuGroups,
  createModule,
  displayWidth,
  LabelName,
}
