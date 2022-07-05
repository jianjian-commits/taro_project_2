import { t } from 'gm-i18n'

const initSpuDetail = {
  alias: [],
  category_id_1: '',
  category_id_2: '',
  category_name_1: '',
  category_name_2: '',
  cms_key: '',
  desc: '',
  detail_images: [],
  detail_image_list: [],
  dispatch_method: 1, // 投框方式
  id: '',
  images: [],
  image_list: [],
  name: '',
  need_pesticide_detect: false, // 是否显示检测报告
  is_open_nutrition: 0, // 是否开启营养素
  p_type: 1, // 商品类型
  pinlei_id: '',
  pinlei_name: '',
  std_unit_name: '',
  customize_code: '',
  new_customize_code: '',
  picking_type: 1, // 临采
  tax_id_for_bill: '',
  tax_rate_for_bill: '',
  perf_method: 1,
}

const defaultNutritionInfo = [
  { name: t('能量'), key: 'energy', per_100g: null, NRV: null, unit: 'KJ' },
  { name: t('蛋白质'), key: 'protein', per_100g: null, NRV: null, unit: 'g' },
  { name: t('脂肪'), key: 'fat', per_100g: null, NRV: null, unit: 'g' },
  {
    name: t('碳水化合物'),
    key: 'carbohydrate',
    per_100g: null,
    NRV: null,
    unit: 'g',
  },
  { name: t('钠'), key: 'element_Na', per_100g: null, NRV: null, unit: 'mg' },
]

// 净菜-供应链信息
const initCleanFoodInfo = {
  cut_specification: '', // 切配规格
  shelf_life: '', // 保质期
  license: '', // 许可证
  material_description: '', // 原料说明
  nutrition: '', // 营养成分表
  origin_place: '', // 产地
  product_performance_standards: '', // 产品执行标准
  recommended_method: '', // 建议使用方法
  storage_condition: '', // 贮存条件
  process_label_id: 0, // 商品标签
  combine_technic_status: 0, // 组合工艺开启状态，0:关闭，1:开启
  combine_technic_lenth: null, // 组合工艺数
  process_unit_status: 0, // 是否开启加工计量单位录入，0:关闭，1:开启
  nutrition_status: 0, // 是否开启营养成分表
  nutrition_info: [...defaultNutritionInfo], // 营养成分表
  unit_process_cost: null, // 单位加工成本
}

// 净菜-物料信息
const initIngredient = {
  attrition_rate: 0, // 设置损耗比例 后台说默认为0
  category_id_2: '',
  id: '', // sku_id
  name: '',
  proportion: 0, // 单位数量-基本单位
  ratio: '',
  remark_type: 2, // 商品类型，默认类型为净菜，只用后台字段，前端不做选择，因此前端默认初始是净菜
  sale_proportion: 0, // 单位数量-包装单位
  sale_unit_name: '',
  std_unit_name: '',
  supplier_id: '',
  technic_flow_len: '', // 工艺数
  version: 0,
  process_unit_name: '', // 加工计量单位
  spu_id: '',
}
const initIngredients = [initIngredient]

// 周转物
const initTurnOver = {
  bind_turnover: 0, // 0-不关联 1-关联
  turnover_bind_type: 1, // 1-取固定值 2-按下单数设置
  tid: '', // 关联周转物id
  turnover_ratio: '', // 数量
}

// 采购规格
const initPurchaseSpecInfo = {
  purchaseSpec: 1, // 1-按spu基本单位 2-自定义
  std_unit_name: '',
  ratio: 1,
  unit_name: '',
}

const initSkuDetail = (
  spuDetail = initSpuDetail,
  supplier_id,
  salemenuSelected = {},
) => {
  return {
    ...initTurnOver,
    sku_id: '',
    sku_name: spuDetail.name || '',
    spu_id: spuDetail.id || '',
    spu_name: spuDetail.name || '',
    outer_id: '', // 自定义编码
    sale_num_least: 1, // 最小下单数
    is_price_timing: false, // 时价
    is_weigh: true, // 称重
    state: 1, // 销售状态
    image_list: spuDetail.image_list || [],
    img_url: spuDetail.images || [], // 商品图片，多图
    partframe: true, // 分拣设置-投框
    slitting: true, // 分拣设置-分切
    attrition_rate: '', // 设置损耗比例
    clean_food: false, // 是否净菜商品
    clean_food_info: initCleanFoodInfo, // clean_food 为1时，净菜相关信息
    desc: spuDetail.desc || '',
    ingredients: initIngredients, // 物料信息
    purchase_spec_id: '', // 采购规格id
    remark_type: 2, // 商品类型默认为2 净菜
    sale_price: '1',
    sale_ratio: 1,
    sale_unit_name: spuDetail.std_unit_name || '',
    salemenu_id: salemenuSelected.value || '',
    salemenu_ids: [salemenuSelected.value] || [], // 多选报价单id
    unity_salemenu_ids: [salemenuSelected.value] || [], // 同步报价单id
    salemenu_name: salemenuSelected.text || '',
    std_sale_price: '',
    std_unit_name: spuDetail.std_unit_name || '',
    std_unit_name_forsale: spuDetail.std_unit_name || '',
    price_cal_type: 1,
    std_sale_price_forsale: '1',
    stock_type: 1, // 库存设置方式: 0-读取上游库存 1-不设置库存 2-设置库存 3-限制库存
    spu_stock: '', // 限制库存-当前可用库存
    stocks: '', // 设置库存
    isRound: false, // 是否开启取整: true-开启 false-关闭
    roundType: 1, // 下单取整: 0-关闭取整 1-向上取整 2-向下取整
    suggest_price_max: '', // 建议价格区间
    suggest_price_min: '', // 建议价格区间
    supplier_id: supplier_id,
    saleSpec: 1, // 销售规格类型： 1-按基本单位 2-自填
    createPurchaseSpec: false, // 新建采购规格还是选择已有采购规格 false-选择已有的 true-新建
    pospal_data: [], // 银豹数据
    box_type: 0, // 装箱类型 0 散件装箱 1 整件装箱
    is_already_clean_food: false, // 是否是已经开启加工商品，用来判断是否不可改变加工开关
    brand: '', // 品牌
    origin_area: '', // 区域
    origin_place: '', // 产地
    specification_desc: '', // 规格描述
    feature_desc: '', // 特征描述
    after_sale_desc: '', // 售后标准
    is_step_price: 0, // 定价规则 0：常规定价 1：阶梯定价
    step_price_table: [
      { index: 0, min: 1, max: '', step_sale_price: '', step_std_price: '' }, // 阶梯定价表格
    ],
  }
}

export {
  initSpuDetail,
  initIngredient,
  initIngredients,
  initSkuDetail,
  initPurchaseSpecInfo,
  initTurnOver,
  initCleanFoodInfo,
  defaultNutritionInfo,
}
