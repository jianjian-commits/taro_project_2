import _ from 'lodash'
/**
 * 判断商品是不是在分摊列表内
 * @param share 分摊字段
 * @param id 商品id
 * @return {boolean}
 */
const isInShare = (share, id) => {
  if (share.length > 0) {
    if (_.includes(share[0].in_sku_logs, id)) {
      return true
    }
  }
  return false
}

const getSku = (sku, in_sales = 1) => {
  return {
    category_id_1: sku.category_id_1,
    category_id_1_name: sku.category_id_1_name,
    category_id_2: sku.category_id_2,
    name: `${sku.sku_name}（${sku.sale_ratio}${sku.std_unit_name}/${sku.sale_unit_name}）`, // 展示的name 也就是displayName
    sku_name: sku.sku_name, // 保存到后台的name
    value: sku.sku_id,
    category: sku.category_id_2_name,
    unit_price: sku.sale_price,
    std_unit: sku.std_unit_name,
    purchase_unit: sku.sale_unit_name,
    ratio: sku.sale_ratio,
    spu_id: sku.spu_id,
    max_stock_unit_price: sku.max_stock_unit_price,
    shelf_id: sku.shelf_id,
    shelf_name: sku.shelf_name,
    in_sales,
  }
}

const isValid = (val) => val !== undefined && val !== null && _.trim(val) !== ''

export { isInShare, getSku, isValid }
