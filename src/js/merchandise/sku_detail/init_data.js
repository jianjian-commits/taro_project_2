import { i18next } from 'gm-i18n'
// salemenuId O 若有则用，无则取saleList[0]
const getSkuChangeInfo = (spuInfo, supplyList, saleList, salemenuId) => {
  return {
    isNew: true,
    sku_id: '',
    outer_id: '',
    spu_id: spuInfo.id,
    sku_name: spuInfo.name,
    desc: spuInfo.desc,
    imgUrlList: spuInfo.imgUrlList && spuInfo.imgUrlList.slice(),
    std_unit_name: spuInfo.std_unit_name,
    sale_unit_name: spuInfo.std_unit_name,
    std_unit_name_forsale: spuInfo.std_unit_name,
    salemenu_id: salemenuId || (saleList.length ? saleList[0].id : ''),
    supply_sku: supplyList.length ? supplyList[0].sku_id : '',
    sale_price: '1',
    std_sale_price_forsale: '1',
    sale_num_least: 1,
    sale_ratio: 1,
    state: 1,
    is_weigh: true,
    partframe: true,
    slitting: true,
    attrition_rate: 0,
    stock_type: 1,
    stocks: 0,
    is_price_timing: false,
    suggest_price_min: '',
    suggest_price_max: '',
    ingredients: [{ name: i18next.t('请选择物料'), attrition_rate: 0 }],
    clean_food: 0,
    remark_type: 7, // 商品类型默认为7 毛菜
    clean_food_info: {
      cut_specification: '',
      license: '',
      material_description: '',
      nutrition: '',
      origin_place: '',
      product_performance_standards: '',
      recommended_method: '',
      storage_condition: '',
    },
  }
}

export { getSkuChangeInfo }
