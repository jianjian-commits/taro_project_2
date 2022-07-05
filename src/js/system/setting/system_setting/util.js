import { t } from 'gm-i18n'
import _ from 'lodash'

const reqUrl = {
  merchandise: '/station/profile_merchandise/update',
  shop: 'profile_bshop/update',
  sales_invoicing: '/station/profile_stock/update',
  sorting: 'profile_sorting/update',
  driver: '/station/profile_driver/update',
  order: '/station/profile_order/update',
  fullScreen: 'profile_screen/update',
  process: '/station/profile_process/update',
  turnover: '/station/profile_turnover/update',
  procurement: '/station/profile_purchase/update',
}

const purchaseDefaultPrice = [
  { text: t('不启用'), value: 0 },
  { text: t('供应商最近询价'), value: 1 },
  { text: t('供应商最近采购价'), value: 2 },
  { text: t('供应商最近入库价'), value: 3 },
  { text: t('库存均价'), value: 4 },
  { text: t('最近询价'), value: 5 },
  { text: t('最近入库价'), value: 6 },
  { text: t('供应商周期报价'), value: 9 },
]

const formula_price_rounding_types = [
  {
    text: t('四舍五入'),
    value: 0,
  },
  {
    text: t('向上取整'),
    value: 1,
  },
  {
    text: t('向下取整'),
    value: 2,
  },
]

const stockInDefaultPrice = [
  { text: t('不启用'), value: 0 },
  { text: t('供应商最近询价'), value: 1 },
  { text: t('供应商最近入库价'), value: 3 },
  { text: t('最近询价'), value: 5 },
  { text: t('最近入库价'), value: 6 },
  { text: t('供应商周期报价'), value: 9 },
]

const ssuPricePrecision = [
  {
    text: t('保留整数'),
    value: 0,
  },
  {
    text: t('保留一位小数'),
    value: 1,
  },
  {
    text: t('保留两位小数'),
    value: 2,
  },
]

const DEFAULT_PLAN_PRODUCE_SETTING = [
  { text: t('不启用'), value: 0 },
  { text: t('启用公式“日均下单数x调整比例x预计备货天数”'), value: 1 },
]

const lockPrintSort = [
  { text: '配送中', value: 1 },
  { text: '已签收', value: 2 },
]

// 订单流默认配置
const orderStreamType = [
  { name: 'bshop', text: t('商城'), value: 0, disabled: true },
  { name: 'purchase_task', text: t('采购任务'), value: 1, disabled: false },
  { name: 'sorting_task', text: t('分拣任务'), value: 2, disabled: false },
  { name: 'distribute_task', text: t('配送任务'), value: 3, disabled: false },
  { name: 'out_stock', text: t('销售出库'), value: 4, disabled: false },
  { name: 'operational_data', text: t('运营数据'), value: 5, disabled: true },
  {
    name: 'customer_settlement',
    text: t('商户结算'),
    value: 6,
    disabled: true,
  },
  { name: 'customer_bill', text: t('商户对账单'), value: 7, disabled: true },
]

// 订单类型
const orderType = [
  { name: 'A', text: t('A类订单'), value: 1, orderStreamType: orderStreamType },
  { name: 'B', text: t('B类订单'), value: 2, orderStreamType: orderStreamType },
]

// 做一层map,tab变动性大，不map跳转过来不能保证就是期望tab
const settingTabsMap = {
  merchandise: t('商品设置'),
  shop: t('商城设置'),
  sales_invoicing: t('进销存设置'),
  sorting: t('分拣设置'),
  driver: t('配送设置'),
  order: t('订单设置'),
  fullScreen: t('投屏设置'),
  process: t('加工设置'),
  procurement: t('采购设置'),
}

/**
 * @param exceptArray 排除不转换的key [key, key, ...]
 * @param boolObject 转换的object
 */
const boolObjectToNumberObject = (boolObject, exceptArray) => {
  const numberObject = { ...boolObject }

  _.each(boolObject, (value, key) => {
    if (!_.includes(exceptArray, key)) {
      numberObject[key] = _.toNumber(value)
    }
  })

  return numberObject
}

// 可勾选的轮播界面
const fullScreenList = [
  { value: 1, text: t('首页投屏') },
  { value: 2, text: t('采购总览') },
  { value: 3, text: t('采购员绩效') },
  { value: 4, text: t('分拣投屏') },
  { value: 5, text: t('分拣员绩效') },
  { value: 6, text: t('司机绩效') },
  { value: 7, text: t('销售驾驶舱') },
]

function transformDist(data) {
  return _.map(data, (city) => ({
    value: city.city_id,
    text: city.city,
    children: _.map(city.districts, (dist) => ({
      value: dist.district_id,
      text: dist.district,
      children: _.map(dist.areas, (area) => ({
        value: area.area_id,
        text: area.area,
      })),
    })),
  }))
}

export {
  reqUrl,
  purchaseDefaultPrice,
  stockInDefaultPrice,
  boolObjectToNumberObject,
  lockPrintSort,
  transformDist,
  DEFAULT_PLAN_PRODUCE_SETTING,
  orderStreamType,
  orderType,
  fullScreenList,
  settingTabsMap,
  ssuPricePrecision,
  formula_price_rounding_types,
}
