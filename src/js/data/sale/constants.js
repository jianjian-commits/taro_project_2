// 订单表格接口order_by_fields: 值为0~10。日期,销售额,销售毛利，订单数，客单价,地理标签,线路，下单金额，销售毛利率，笔单价
export const COUNT_LIST_ENUM = {
  order_time: 0,
  account_price: 1,
  saleProfit: 2,
  old_order_id: 3,
  avg_customer_price: 4,
  area_id: 5,
  route_id: 6,
  order_price: 7,
  saleProfitRate: 9,
  delta_money: 10,
  shop_id: 12,
}
// # 订单商品表格接口order_by_fields:值为0~12.代表日期,销售额，下单频次，售后频次，一级分类，二级分类，品类，销售规格，基本单位出库数，出库金额，税额，销售毛利，销售毛利率
export const PRODUCT_LIST_ENUM = {
  order_time: 0,
  account_price: 1,
  quantity: 16,
  售后频次: 3,
  category_id_1_name: 4,
  category_id_2_name: 5,
  pinlei_id_name: 6,
  remark: 7,
  sku_std_outstock_quantity_forsale: 8,
  outstock_price: 9,
  tax: 10,
  saleProfit: 11,
  saleProfitRate: 12,
  skuid: 13,
  order_price: 14,
  shop_id: 15,
}
