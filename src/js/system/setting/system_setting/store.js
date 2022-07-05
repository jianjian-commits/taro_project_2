import { observable, action } from 'mobx'
import { Request } from '@gm-common/request'
import { Storage, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'

import { reqUrl, boolObjectToNumberObject, transformDist } from './util'
import globalStore from '../../../stores/global'

const initMerchandiseObject = {
  /** 商品ID展现方式 */
  show_sku_outer_id: 0,
  /** 建议价格区间 */
  show_suggest_price: 0,
  /** 税额展示 */
  show_tax_rate: 0,
  /** 同步时价商品 */
  sync_price_timing: 0,
  /** 商品公式定价精确度 0-取整，1保留一位，2-保留两位，默认保留两位 */
  formula_price_precision: 0,
  /** 商品公式定价取舍方法 0-四舍五入，1-向上取整，2-向下取整，默认四舍五入 */
  formula_price_rounding_type: 0,
}

const initShopObject = {
  show_order_remark: true,
  default_settle_way: 1,
}

const initSalesInvoicingObject = {
  batch_in_stock: 0,
  in_stock_price_warning: 0,
  weigh_stock_in: 0,
  weigh_check: 0,
  // purchase_sheet_ref_price: 0,
  in_stock_ref_price: 0,
  is_negative_allow: 1,
  auto_select_batch: 1,
  select_batch_method: 1,
  shelf_life_warning: 0,
  before_warn_days: null,
  // TODO: 增加这个选项不知道字段
}

const initSortingData = {
  generate_sort_num_rule_classification: 0,
  generate_sort_num_rule: 0,
  sorting_product_code_type: false,
  show_res_custom_code: 0,
  lock_sort_print: false,
  sorting_edit_lock: 1,
  sale_unit_sort_independence: 0,
  box_number_rule: 0,
}

const initDriverObject = {
  en_driver_performance: 0,
  en_driver_pic_received: 0,
  distribution_limit: 0,
  distribution_areas: [],
  station_addr: '',
  lat: '',
  lng: '',
  delivery_distance: 0,
}

const initFullScreenData = {
  is_set_carousel: 0, // 是否开启投屏轮播 0-关闭 1-开启
  carousel_interface: [], // 勾选的轮播界面
  stay_time: null, // 停留时长
}

const initProcessData = {
  order_request_release_amount_type: 1,
  // 加工计划算法配置
  process_order_suggest_plan_amount_config: {
    is_active: 0, // 是否启用算法， 0为不启用
    query_order_type: 1, // 日均下单数设置
    query_order_days: null, // 手动填写的最近下单数，query_order_type === 1时使用
    adjust_ratio: null, // 调整比例
    stock_up_type: null, // 备货天数类型，1为按手动填写，2为按保质期
    stock_up_days: null, // 手动填写的备货天数，stock_up_type === 1 时使用
    is_deduct_stock: 0, // 是否扣减库存
  },
}

const initTurnoverData = {
  is_turnover_sync: 0,
  is_turnover_deposit: 0,
  turnover_driver_modify: 0,
  turnover_driver_return: 0,
  turnover_driver_loan: 0,
}

const initPurchassData = {
  purchase_sheet_ref_price: 0, // 是否启用采购默认设置
  recommended_purchase_setting: 1, // 选择计算方式
  ban_generate_multiple_times: 1, // 1为禁止多次生成，0为可多次生成
}

class Store {
  @observable merchandiseData = { ...initMerchandiseObject }

  @observable shopData = { ...initShopObject }

  @observable salesInvoicingData = { ...initSalesInvoicingObject }

  @observable sortingData = { ...initSortingData }

  @observable driverData = { ...initDriverObject }

  @observable fullScreenData = { ...initFullScreenData }

  @observable processData = { ...initProcessData }

  @observable turnoverData = { ...initTurnoverData }

  @observable purchassData = { ...initPurchassData }

  // 运费管理详情页那边需要跳转过来直接到配送设置的tab，所以在那边也修改了key为system-setting-tab-type的Storage
  @observable activeTab = Storage.get('system-setting-tab-type') || 0

  @observable address = []

  @action
  async fetchAddress() {
    const result = await Request('/station/area_dict').get()
    this.address = transformDist(result.data)
  }

  @action
  setActiveType(tab) {
    this.activeTab = tab
    Storage.set('system-setting-tab-type', tab)
  }

  @action
  initData(type, data) {
    if (type === 'merchandise') {
      Object.assign(this.merchandiseData, { ...data })
    } else if (type === 'shop') {
      Object.assign(this.shopData, { ...data })
    } else if (type === 'sales_invoicing') {
      Object.assign(this.salesInvoicingData, { ...data })
    } else if (type === 'sorting') {
      Object.assign(this.sortingData, { ...data })
    } else if (type === 'driver') {
      Object.assign(this.driverData, { ...data })
    } else if (type === 'fullScreen') {
      this.fullScreenData = { ...this.fullScreenData, ...data }
    } else if (type === 'process') {
      Object.assign(this.processData, { ...data })
    } else if (type === 'turnover') {
      Object.assign(this.turnoverData, { ...data })
    } else if (type === 'procurement') {
      Object.assign(this.purchassData, { ...data })
    }
  }

  @action
  changeDataItem(type, name, value) {
    if (type === 'merchandise') {
      this.merchandiseData[name] = value
    } else if (type === 'shop') {
      this.shopData[name] = value
    } else if (type === 'sales_invoicing') {
      this.salesInvoicingData[name] = value
    } else if (type === 'sorting') {
      this.sortingData[name] = value
    } else if (type === 'driver') {
      this.driverData[name] = value
    } else if (type === 'fullScreen') {
      this.fullScreenData[name] = value
    } else if (type === 'process') {
      this.processData[name] = value
    } else if (type === 'turnover') {
      this.turnoverData[name] = value
    } else if (type === 'procurement') {
      this.purchassData[name] = value
    }
  }

  /**
   * 改变算法配置
   * @param {string} name 字段名
   * @param {number | string}} value 值
   */
  @action
  changeProcessPlanAlgorithm(name, value) {
    this.processData.process_order_suggest_plan_amount_config[name] = value
  }

  /**
   * 获取商品设置待提交数据
   */
  @action
  getMerchandisePostData() {
    const {
      show_sku_outer_id,
      show_suggest_price,
      show_tax_rate,
      sync_price_timing,
      formula_price_precision,
      formula_price_rounding_type,
    } = this.merchandiseData
    let req = {
      sync_price_timing,
      show_sku_outer_id,
      formula_price_precision,
      formula_price_rounding_type,
    }
    if (globalStore.hasPermission('edit_suggest_price')) {
      req = Object.assign({}, req, { suggest_price: show_suggest_price })
    }
    if (globalStore.hasPermission('edit_tax')) {
      req = Object.assign({}, req, { show_tax_rate })
    }

    return boolObjectToNumberObject(req, [])
  }

  /**
   * 获取商城设置待提交数据
   */
  @action
  getShopPostData() {
    const { show_order_remark, default_settle_way } = this.shopData
    const hasEditSettleWayPermission = globalStore.hasPermission(
      'edit_default_settle_way',
    )
    const postData = {
      allow_order_remark: show_order_remark,
    }

    if (hasEditSettleWayPermission) {
      postData.default_settle_way = default_settle_way
    }

    return boolObjectToNumberObject(postData, [])
  }

  @action
  getProcessData() {
    const {
      process_order_suggest_plan_amount_config,
      order_request_release_amount_type,
    } = this.processData

    const postData = { order_request_release_amount_type }

    const {
      is_active,
      query_order_type,
      query_order_days,
      adjust_ratio,
      stock_up_type,
      stock_up_days,
      is_deduct_stock,
    } = process_order_suggest_plan_amount_config

    // 加工计划算法
    const suggestData = {
      is_active,
    }

    if (is_active === 1) {
      Object.assign(suggestData, {
        query_order_type,
        query_order_days: query_order_type === 1 ? query_order_days : undefined,
        adjust_ratio,
        stock_up_type,
        stock_up_days: stock_up_type === 1 ? stock_up_days : undefined,
        is_deduct_stock: is_deduct_stock,
      })
    }

    return Object.assign(boolObjectToNumberObject(postData, []), {
      process_order_suggest_plan_amount_config: JSON.stringify(suggestData),
    })
  }

  /**
   * 获取进销存设置待提交数据
   */
  @action
  getSalesInvoicingPostData() {
    const {
      batch_in_stock,
      in_stock_price_warning,
      weigh_stock_in,
      weigh_check,
      // purchase_sheet_ref_price,
      in_stock_ref_price,
      is_negative_allow,
      auto_select_batch,
      select_batch_method,
      shelf_life_warning,
      before_warn_days,
    } = this.salesInvoicingData
    const hasEditMultiBatch = globalStore.hasPermission('edit_multi_batch')
    // const hasEditPurchaseSheetRefPrice = globalStore.hasPermission(
    //   'edit_purchase_sheet_ref_price',
    // )
    const hasEditInStockRefPrice = globalStore.hasPermission(
      'edit_in_stock_ref_price',
    )
    const { stock_method } = globalStore.user

    const postData = {
      in_stock_price_warning,
      weigh_stock_in,
      weigh_check,
      is_negative_allow,
      auto_select_batch,
      select_batch_method,
    }
    // 只有先进先出
    if (stock_method === 2) {
      postData.shelf_life_warning = shelf_life_warning
      if (shelf_life_warning) {
        postData.before_warn_days = before_warn_days
      }
    }

    if (hasEditMultiBatch) {
      postData.allow_multi_batch = batch_in_stock
    }

    // if (hasEditPurchaseSheetRefPrice) {
    //   postData.purchase_sheet_ref_price = purchase_sheet_ref_price
    // }

    if (hasEditInStockRefPrice) {
      postData.in_stock_ref_price = in_stock_ref_price
    }

    return Object.assign(boolObjectToNumberObject(postData, []))
  }

  /**
   * 获取分拣设置待提交数据
   */
  @action
  getSortingPostData() {
    const hasEditGenerateSortNumRulePermission = globalStore.hasPermission(
      'edit_generate_sort_num_rule',
    )
    const hasEditSortingProductCode = globalStore.hasPermission(
      'edit_sorting_product_code',
    )

    const postData = {}
    const hasEditResCustomCode = globalStore.hasPermission(
      'get_res_custom_code',
    )
    const hasEditSortingLock = globalStore.hasPermission('edit_sorting_lock')

    const {
      generate_sort_num_rule,
      sorting_product_code_type,
      show_res_custom_code,
      sorting_edit_lock,
      lock_sort_print,
      sale_unit_sort_independence,
      box_number_rule,
    } = this.sortingData

    if (hasEditGenerateSortNumRulePermission) {
      postData.generate_sort_num_rule = generate_sort_num_rule
    }

    if (hasEditSortingProductCode) {
      postData.sorting_product_code_type = sorting_product_code_type ? 2 : 1
    }

    if (hasEditResCustomCode) {
      postData.show_res_custom_code = show_res_custom_code
    }

    if (hasEditSortingLock) {
      postData.sorting_edit_lock = lock_sort_print ? sorting_edit_lock : 0
    }

    postData.sale_unit_sort_independence = sale_unit_sort_independence // todo 权限
    // 箱号生成规则
    postData.box_number_rule = box_number_rule

    return boolObjectToNumberObject(postData, [])
  }

  /**
   * 获取司机设置待提交数据
   */
  @action
  getDriverPostData() {
    const {
      en_driver_performance,
      en_driver_pic_received,
      distribution_limit,
      distribution_areas,
      lng,
      lat,
      station_addr,
      delivery_distance,
    } = this.driverData
    return boolObjectToNumberObject(
      {
        en_driver_performance,
        en_driver_pic_received,
        distribution_limit,
        distribution_areas: JSON.stringify(distribution_areas),
        site:
          lat && lng && station_addr
            ? JSON.stringify({
                lng,
                lat,
                station_addr,
              })
            : JSON.stringify({}),
        delivery_distance,
      },
      ['distribution_areas', 'site'],
    )
  }

  /**
   * 获取投屏设置页传给后端参数
   */
  @action
  getFullScreenData() {
    const {
      is_set_carousel,
      carousel_interface,
      stay_time,
    } = this.fullScreenData

    return {
      is_set_carousel: is_set_carousel ? 1 : 0,
      carousel_interface: JSON.stringify(carousel_interface),
      stay_time,
    }
  }

  /**
   * 获取周转物设置数据
   */
  @action
  getTurnoverData() {
    const {
      is_turnover_sync: sync,
      is_turnover_deposit: deposit,
      turnover_driver_modify: modify,
      turnover_driver_return: _return,
      turnover_driver_loan: loan,
    } = this.turnoverData
    const getSearchData = (value) => (value ? 1 : 0)
    return {
      is_turnover_sync: getSearchData(sync),
      is_turnover_deposit: sync ? getSearchData(deposit) : 0, // 开启了周转物才可以编辑押金，默认押金关闭
      turnover_driver_modify: getSearchData(modify),
      turnover_driver_return: getSearchData(_return),
      turnover_driver_loan: getSearchData(loan),
    }
  }

  /**
   * 获取采购设置的
   */
  @action
  getPurchassData() {
    const {
      purchase_sheet_ref_price,
      recommended_purchase_setting,
      ban_generate_multiple_times,
    } = this.purchassData
    const hasEditPurchaseSheetRefPrice = globalStore.hasPermission(
      'edit_purchase_sheet_ref_price',
    )
    if (hasEditPurchaseSheetRefPrice) {
      this.purchassData.purchase_sheet_ref_price = purchase_sheet_ref_price
    }
    return {
      purchase_sheet_ref_price,
      recommended_purchase_setting,
      ban_generate_multiple_times,
    }
  }

  @action
  postSetting(type) {
    const url = reqUrl[type]

    let req = {}
    if (type === 'merchandise') {
      req = this.getMerchandisePostData()
    } else if (type === 'shop') {
      req = this.getShopPostData()
    } else if (type === 'sales_invoicing') {
      req = this.getSalesInvoicingPostData()
    } else if (type === 'sorting') {
      req = this.getSortingPostData()
    } else if (type === 'driver') {
      req = this.getDriverPostData()
      if (req.distribution_limit === 2) {
        if (!req.delivery_distance) {
          Tip.warning(t('请输入可配送距离'))
          return
        }
        if (req.site === '{}') {
          Tip.warning(t('请输入站点位置'))
          return
        }
      }
    } else if (type === 'fullScreen') {
      req = this.getFullScreenData()
    } else if (type === 'process') {
      req = this.getProcessData()
    } else if (type === 'turnover') {
      req = this.getTurnoverData()
    } else if (type === 'procurement') {
      req = this.getPurchassData()
    }

    return Request(url).data(req).post()
  }
}

export default new Store()
