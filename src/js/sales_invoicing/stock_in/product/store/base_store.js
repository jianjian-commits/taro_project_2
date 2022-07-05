import moment from 'moment'
class BaseData {
  constructor() {
    this.initFilter = {
      type: 2,
      begin: moment().startOf('day'),
      end: moment().endOf('day'),
      search_text: '',
      status: '5',
      is_print: -1, // -1:全部 0:未打印 1:已打印
      search_type: 1,
    }

    this.initStockInReceiptDetail = {
      share: [], // 已抽出
      discount: [], // 已抽出
      details: [], // 已抽出
      sku_money: null,
      creator: null,
      date_time: null,
      delta_money: null,
      id: null,
      purchase_sheet_id: null,
      settle_sheet_number: null,
      remark: null,
      settle_supplier_id: null,
      station_id: null,
      status: null,
      submit_time: moment().startOf('day').format('YYYY-MM-DD'), // 后台会返回，为了兼容旧ui，新ui用new,提交时需去掉
      submit_time_new: moment().startOf('day').format('YYYY-MM-DD HH:mm'),
      supplier_customer_id: null,
      supplier_name: null,
      type: null,
      is_frozen: false,
    }

    this.initStockInReceiptList = {
      // 后台返回
      batch_number: null,
      category: null,
      category_name_1: null,
      category_name_2: null,
      different_price: null,
      id: null,
      is_arrival: null,
      is_from_purchase: null,
      life_time: null,
      money: null,
      name: null,
      operator: null,
      production_time: null,
      purchase_unit: null,
      quantity: null,
      ratio: null,
      remark: undefined,
      shelf_id: null,
      shelf_name: null,
      spu_id: null,
      spu_status: null,
      std_unit: null,
      supplier_stock_avg_price: null,
      unit_price: null,
      // purchase_table
      purchase_price: null,
      purchase_amount: null,
      purchase_unit_quantity: null,
      purchase_unit_price: null,
      // 参考成本 start
      last_in_stock_price: null,
      last_purchase_price: null,
      last_quote_price: null,
      latest_in_stock_price: null,
      latest_quote_price: null,
      stock_avg_price: null,
      max_stock_unit_price: null,
      latest_purchase_price: null,
      supplier_cycle_quote: null,
      // 参考成本 end
      tax_rate: null,
      tax_money: null,
      instock_money_no_tax: null,
      // 辅助数据
      shelfSelected: [],
      uniqueKeyForSelect: null, // 用作表格选择标示项
      shelfLife: null, // 用于填写保质期的天数
      tare_quantity: null, // 皮重
    }

    this.initStockInOperatedShare = {
      action: '0',
      method: '1',
      remark: '',
      reason: 0,
      money: '',
      // selected: [], // 后端说多余的
      in_sku_logs: [],
    }
  }
}

export default BaseData
