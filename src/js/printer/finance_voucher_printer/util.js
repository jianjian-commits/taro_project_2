import _ from 'lodash'
import Big from 'big.js'

/**
 *
 * @param {*} dividend
 * @param {*} divisor
 * @returns 判断一个数是否可以被第二位数整除
 */
export const isDivisible = (dividend, divisor) => dividend % divisor === 0

const item = {
  id: '',
  sorting_unit: 1,
  before_change_price_forsale: 1,
  before_change_price: 1,
  name: '',
  sku_production_date: null,
  detail_id: 12230,
  category_id_1: 'A132761',
  category_id_2: 'B281758',
  category_title_1: '草率',
  category_title_2: '可乐',
  pinlei_title: '301刚',
  desc: '',
  union_dispatch: true,
  spu_name: '鸭肉',
  spu_customize_code: '',
  sale_ratio: 1,
  specs: '-',
  origin_item_price: 1,
  total_item_price: 1,
  real_item_price: 0,
  quantity: 1,
  sale_unit_name: '',
  sale_price: '',
  origin_purchase_quantity: 1,
  real_weight: '',
  sku_std_outstock_quantity: '1.00',
  sku_std_outstock_quantity_forsale: '1.00',
  saleunit_weighting_quantity: 1,
  std_sale_price: 1,
  outstock_quantity: '1.00',
  std_sale_price_forsale: 1,
  org_sale_price: 1,
  org_std_sale_price: 1,
  org_std_sale_price_forsale: 1,
  org_item_price: 1,
  account_price: 1,
  accept_quantity: 1,
  sku_std_accept_quantity: 1,
  sku_std_accept_quantity_forsale: 1,
  std_unit_name: '斤',
  std_unit_name_forsale: '斤',
  salemenu_id: 'S20433',
  outer_id: '',
  remark: '',
  is_price_timing: 0,
  real_is_weight: 1,
  is_weigh: '1',
  tax_rate: 0,
  is_set_tax: 0,
  production_time: null,
  life_time: null,
  box_list: [],
  salemenu_price: '1.000000',
  sale_outstock_quantity: '1.00',
  sale_outstock_price: '1.00',
  detail_customized_field: null,
  origin_area: null,
  origin_place: null,
  brand: null,
  specification_desc: null,
  feature_desc: null,
  after_sale_desc: null,
  fee_type: 'CNY',
  supplier_id: 'T13384',
  supplier_name: '综合供应商',
  tax: 0,
  sale_price_without_tax: 1,
  real_item_price_without_tax: 1,
  purchase_station_id: 'T7936',
}

/**
 *
 * @param {*} n
 * @returns 保留两位小数
 */
export const priceReal = (n) => {
  const result = Big(n || 0).toFixed(2)
  return result
}
/**
 *
 * @param {*} listNum 要修改的数组
 * @param {*} num 填充的倍数
 * @returns 讲传入的数组填充num倍
 */
export const fillList = (listNum, num) => {
  // 刚好整除不用做计算
  if (isDivisible(listNum.length, num)) return listNum
  // 例如数组长度是17,倍数是14,要得到的结果是将数组的个数填充到28
  // 数组长度  倍数 newArrLength
  // 11       14     3
  // 17       14    11 (14 - (17 % 14))
  const newArrLength =
    listNum.length < num ? num - listNum.length : num - (listNum.length % num)
  listNum.push(..._.fill(Array(newArrLength), item))
  return listNum
}
