import actionTypes from './action.types'
import { combineAsyncReducers } from 'redux-async-actions-reducers'
/* eslint-disable */
// 后台把数据放在页面上，列为可能不可靠数据（后台不一定保证有数据），做好兼容
let g_user = window.g_user || {}
g_user.permission = g_user.permission || []

const globalInitState = {
  user: g_user,

  // 可以移除，保险起见，先保留
  clean_food_station: !!window.g_clean_food, // 净菜
  show_order_remark: !!window.g_show_order_remark, // 显示订单备注
  // end
  show_tax_rate: !!window.g_show_tax_rate,

  purchaseInfo: window.g_supplier_data,
  show_sku_outer_id: !!window.g_show_sku_outer_id,
  batch_in_stock: !!window.g_batch_in_stock,
  default_settle_way: window.g_default_settle_way,
  group_id: window.g_group_id,
  show_suggest_price: !!window.g_show_suggest_price, // 显示建议价格区间

  unitName: [],
  generate_sort_num_rule: window.g_generate_sort_num_rule,
  generate_sort_num_rule_classification:
    window.g_generate_sort_num_rule_classification,
  in_stock_price_warning: window.g_in_stock_price_warning, // 入库单价预警维度
}
/* eslint-enable */

const global = (state = globalInitState, action) => {
  switch (action.type) {
    case actionTypes.GLOBAL_GET_UNIT_NAME: {
      return Object.assign({}, state, {
        unitName: action.data,
      })
    }

    default:
      return state
  }
}

const reducers = {
  global,
  freight: null,
  smmIndex: null,
  smm: null,
  smmPre: null,
  fqt: null,
  home: {
    yesterday: {
      totalNum: 0,
    },
    today: {
      totalNum: 0,
      orderCount: 0,
      orderPrice: 0,
    },
  },
  price_rule: null,
  spu_remark: null,
  order: null,
  report: null,
  buy_sell_return_manage: null,
  jd: {
    upList: [],
    downList: [],
  },
  sorting: null,
  purchaseSheetManage: null,
  purchaseSheetPreStorage: null,
  carManage: null,
  driverMap: null,
  routeManage: null,
  purchase_task: null,

  sortSetting: null,

  merchandiseCommon: null,
  merchandiseList: null,
  merchandisePurchase: null,
  merchandiseSale: null,
  merchandiseCateManage: null,
  merchandiseSkuCommon: null,
  merchandiseDetail: null,
  material: null,
  product: null,
  inventory: null,
  payment_review: null,
  station: null,
  cargoLocation: null,
  supplier: null,

  distribute_template: null,
  distributeOrder: null,
  distributeDriver: null,
}

const rootReducer = combineAsyncReducers(reducers)

export default rootReducer
