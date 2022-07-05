import { t } from 'gm-i18n'

// 系统模板必填
const TYPE_1_LIST = [
  'sku_name',
  'spu_id',
  'unit_price',
  'is_price_timing',
  'sale_unit_name',
  'sale_ratio',
  'attrition_rate',
  'sale_num_least',
  'state',
  'is_weigh',
  'stock_type',
  'customer_id',
  'box_type',
]
// 普通模板必填
const TYPE_2_LIST = ['sku_name']
const keyMap = {
  sku_name: t('规格名'),
  spu_id: t('SPUID'),
  outer_id: t('自定义编码'),
  desc: t('规格描述'),
  unit_price: t('单价'),
  is_price_timing: t('是否时价'),
  sale_unit_name: t('销售单位'),
  sale_ratio: t('销售规格'),
  attrition_rate: t('损耗率'),
  sale_num_least: t('最小下单数'),
  state: t('销售状态'),
  is_weigh: t('是否称重'),
  stock_type: t('库存类型'),
  stocks: t('库存数'),
  origin_area: t('区域'),
  origin_place: t('产地'),
  brand: t('品牌'),
  specification_desc: t('商品规格'),
  feature_desc: t('商品特征'),
  after_sale_desc: t('售后标准'),
  customer_id: t('默认供应商编码'),
  box_type: t('装箱类型'),
}

// 字段说明
const explainList = [
  {
    name: t('规格名'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('必填项'),
  },
  {
    name: t('SPUID'),
    standard: t('按系统SPUID填写'),
    isRequired: t('通过功能推荐SPUID'),
  },
  {
    name: t('自定义编码'),
    standard: t('不可以字母D开头'),
    isRequired: t('默认为空'),
  },
  {
    name: t('规格描述'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('默认为空'),
  },
  {
    name: t('单价'),
    standard: t('数字，支持小数点后两位，超过两位则只取前两位'),
    isRequired: t('默认为0.01'),
  },
  {
    name: t('是否时价'),
    standard: t('1时价，0非时价'),
    isRequired: t('默认为0'),
  },
  {
    name: t('销售单位'),
    standard: t('文本'),
    isRequired: t('默认和当前SPU的基本单位一致'),
  },
  {
    name: t('销售规格'),
    standard: t('数字，支持小数点后两位，超过两位则只取前两位'),
    isRequired: t('默认为1'),
  },
  {
    name: t('损耗率'),
    standard: t('数字，支持小数点后两位，超过两位则只取前两位'),
    isRequired: t('默认为0'),
  },
  {
    name: t('最小下单数'),
    standard: t('数字，支持小数点后两位，超过两位则只取前两位'),
    isRequired: t('默认为1'),
  },
  {
    name: t('销售状态'),
    standard: t('1上架，0下架'),
    isRequired: t('默认为1'),
  },
  {
    name: t('是否称重'),
    standard: t('1称重，0不称'),
    isRequired: t('默认为1'),
  },
  {
    name: t('库存类型'),
    standard: t('0不设置库存，1限制库存，2设置库存'),
    isRequired: t('默认为0'),
  },
  {
    name: t('库存数'),
    standard: t('数字，保留两位小数，仅当库存设置选择2时生效'),
    isRequired: t('默认为1'),
  },
  {
    name: t('区域'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('默认为空'),
  },
  {
    name: t('产地'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('默认为空'),
  },
  {
    name: t('品牌'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('默认为空'),
  },
  {
    name: t('商品规格'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('默认为空'),
  },
  {
    name: t('商品特征'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('默认为空'),
  },
  {
    name: t('售后标准'),
    standard: t('文本，包括字符50字数之内'),
    isRequired: t('默认为空'),
  },
  {
    name: t('默认供应商编码'),
    standard: t('填写供应商编码'),
    isRequired: t('取可供应当前商品的ID较小的供应商'),
  },
  {
    name: t('装箱类型'),
    standard: t('0散件装箱，1整件装箱'),
    isRequired: t('默认为0'),
  },
]

const hasSameItem = (list) => {
  const set = new Set(list)
  return list.length !== set.size
}

export { keyMap, explainList, hasSameItem, TYPE_1_LIST, TYPE_2_LIST }
