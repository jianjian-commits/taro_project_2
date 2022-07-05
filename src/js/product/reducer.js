import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import ACTION_STORAGE_KEY_NAMES from '../common/action_storage_key_names'
import { mapActionStorage } from 'gm-service/src/action_storage'
import _ from 'lodash'
import Big from 'big.js'
import {
  getCascadeSelectedName,
  getShelfSelectedValueForCascade,
} from '../common/util'

const now = new Date()

const reducers = {}
const initState = {
  supplyGroup: [],
  selectSupplier: null,
  shareProduct: [],
  skuList: [],

  // 入库
  inStock: {
    filter: {
      type: 2,
      begin: now,
      end: now,
      search_text: '',
      status: '5',
      pagination: {
        offset: 0,
        limit: 10,
      },
    },
    list: [],
    loading: false,
    in_query: false,
    in_query_search_text: '',
  },
  inStockDetail: {
    status: 1, // 只有未入库状态可编辑
    details: [{}],
    share: [],
    discount: [],
  },
  // 货位信息
  shelfList: [],

  saleSku: [],
  inStockBatchImportList: [],

  // 出库
  outStockStatusMap: {
    1: i18next.t('待出库'),
    2: i18next.t('已出库'),
    3: i18next.t('已删除'),
  },
  outStockTimeTypeMap: {
    1: i18next.t('按出库日期'),
    2: i18next.t('按建单日期'),
    3: i18next.t('按运营周期'),
    4: i18next.t('按收货日期'),
  },
  outStock: {
    filter: {
      type: 2,
      begin: now,
      end: now,
      search_text: '',
      status: 0,
      pagination: {
        offset: 0,
        limit: 10,
      },
      time_config_id: '',
    },
    list: [],
    loading: false,
    in_query: false,
    in_query_search_text: '',
  },
  outStockId: '',
  outStockObject: '',
  outStockDetail: {
    status: 1, // 只有未入库状态可编辑
    details: [{}],
  },
  serviceTime: [],

  // 退货
  refundStock: {
    filter: {
      type: 2,
      begin: now,
      end: now,
      search_text: '',
      status: 5,
      pagination: {
        offset: 0,
        limit: 10,
      },
    },
    list: [],
    loading: false,
    in_query: false,
    in_query_search_text: '',

    // 表格选择
    refundListSelected: [],
    // 是否全选所有页
    isAllPageSelect: false,
    // 打印数据
    printList: [],
  },
  refundStockDetail: {
    id: '',
    submit_time: '-',
    creator: '',
    settle_supplier_id: '',
    settle_sheet_number: '',
    supplier_name: '',
    total_price: 0,
    status: 1,
    details: [{}],
    discount: [],
  },
  refundStockBatchImportList: [],
}

reducers.product = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.PRODUCT_SUPPLIERS: {
      const PSMapping = _.map(action.supplyGroup, (PS) => {
        return {
          label: PS.name,
          children: _.map(PS.settle_suppliers, (ss) => {
            return {
              value: ss._id,
              text: ss.name,
            }
          }),
        }
      })
      return Object.assign({}, state, { supplyGroup: PSMapping })
    }

    case actionTypes.PRODUCT_SELECTED_SUPPLIER:
      return Object.assign({}, state, { selectSupplier: action.selectSupplier })

    case actionTypes.PRODUCT_SHARE_PRODUCT:
      return Object.assign({}, state, { shareProduct: action.shareProduct })

    case actionTypes.PRODUCT_SKU_LIST: {
      const saleSku = state.saleSku
      saleSku[action.index] = action.list
      return Object.assign({}, state, { saleSku })
    }

    // 入库
    case actionTypes.PRODUCT_IN_STOCK_DETAIL: {
      const inStockDetail = {
        ...action.list,
        details: _.map(action.list.details, (item) => {
          const {
            quantity = 0,
            ratio,
            money,
            name,
            std_unit,
            purchase_unit,
            unit_price,
            shelf_id,
          } = item
          // 入库(包装单位)    注:包装单位 = 采购单位 = 销售单位
          const purchase_unit_quantity = Big(quantity).div(ratio) // 这个作为一个中间变量
          const displayName = name + `（${ratio}${std_unit}/${purchase_unit}）`

          return {
            ...item,
            shelfSelectedValue:
              state.shelfList.length !== 0
                ? getShelfSelectedValueForCascade(state.shelfList, shelf_id)
                : undefined,
            displayName,
            different_price: Big(money)
              .minus(Big(unit_price).times(quantity).toFixed(4))
              .toFixed(2),
            purchase_unit_quantity: purchase_unit_quantity.toFixed(4),
            purchase_unit_price: !purchase_unit_quantity.eq(0)
              ? Big(money || 0)
                  .div(purchase_unit_quantity)
                  .toFixed(2)
              : 0,
          }
        }),
      }

      if (inStockDetail.details.length === 0) {
        inStockDetail.details.push({})
      }

      return Object.assign({}, state, { inStockDetail: inStockDetail })
    }

    case actionTypes.PRODUCT_IN_STOCK_DETAIL_INIT: {
      return Object.assign({}, state, {
        inStockDetail: {
          status: 1, // 只有未入库状态可编辑
          details: [],
          share: [],
          discount: [],
        },
      })
    }

    case actionTypes.PRODUCT_IN_DETAILS_ITEM_FIELD_CHANGE: {
      const details = [...state.inStockDetail.details]
      const { index, value, field } = action
      if (!details[index]) {
        details[index] = {}
      }

      details[index][field] = value

      let sku_money = 0
      // 实时更新商品金额
      if (details.length) {
        _.forEach(details, (v) => {
          sku_money = Big(sku_money)
            .plus(v.money || 0)
            .toFixed(2)
        })
      }

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, {
          details,
          sku_money,
        }),
      })
    }

    case actionTypes.PRODUCT_IN_ORDER_REMARK_CHANGE: {
      return {
        ...state,
        inStockDetail: {
          ...state.inStockDetail,
          remark: action.value,
        },
      }
    }

    case actionTypes.PRODUCT_IN_STOCK_BATCH_IMPORT: {
      return Object.assign({}, state, {
        inStockBatchImportList: action.sheetData,
      })
    }

    case actionTypes.PRODUCT_IN_PRODUCT_DATE_CHANGE:
      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, {
          submit_time: action.submit_time,
        }),
      })

    case actionTypes.PRODUCT_IN_PRO_DETAIL_ADD: {
      const details = [...state.inStockDetail.details]
      details.push({})

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_IN_PRO_DETAIL_DEL: {
      let { details, sku_money } = state.inStockDetail

      // 实时更新商品金额
      if (details.length && details[action.index].money) {
        sku_money = Big(sku_money).minus(details[action.index].money).toFixed(2)
      }
      details.splice(action.index, 1)

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, {
          details,
          sku_money,
        }),
      })
    }

    case actionTypes.PRODUCT_IN_PRODUCT_NAME_SELECTED: {
      const details = [...state.inStockDetail.details]
      const avgPrice = action.selected
        ? action.selected.supplier_stock_avg_price
        : undefined
      if (!details[action.index]) {
        details[action.index] = {}
      }

      if (avgPrice) details[action.index].supplier_stock_avg_price = avgPrice

      // 清空入库单价（基本单位）（包装单位），金额
      details[action.index].money = null
      details[action.index].purchase_unit_price = null
      details[action.index].unit_price = null
      if (action.selected) {
        details[action.index].name = action.selected.sku_name // 传给后台用原始的sku_name
        details[action.index].displayName = action.selected.name // 展示用的name
        details[action.index].id = action.selected.value
        details[action.index].category = action.selected.category
        details[action.index].std_unit = action.selected.std_unit
        details[action.index].purchase_unit = action.selected.purchase_unit
        details[action.index].ratio = action.selected.ratio
        details[action.index].spu_id = action.selected.spu_id
        details[action.index].max_stock_unit_price =
          action.selected.max_stock_unit_price
        details[action.index].shelfSelectedValue = action.shelf_ids
      } else {
        details[action.index].name = null // 传给后台用原始的sku_name
        details[action.index].displayName = null // 展示用的name
        details[action.index].id = null
        details[action.index].category = null
        details[action.index].std_unit = null
        details[action.index].purchase_unit = null
        details[action.index].ratio = null
        details[action.index].spu_id = null
        details[action.index].max_stock_unit_price = null
        details[action.index].shelfSelectedValue = null
      }

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_IN_PRODUCT_LIFE_TIME_CHANGE: {
      const details = [...state.inStockDetail.details]
      if (!details[action.index]) {
        details[action.index] = {}
      }
      details[action.index].life_time = action.time
      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_IN_PRODUCT_PRODUCTION_TIME_CHANGE: {
      const details = [...state.inStockDetail.details]
      if (!details[action.index]) {
        details[action.index] = {}
      }
      details[action.index].production_time = action.time
      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_IN_PRODUCT_SHELF_CHANGE: {
      const details = [...state.inStockDetail.details]
      if (!details[action.index]) {
        details[action.index] = {}
      }

      details[action.index].shelfSelectedValue = action.selectedValue
      details[action.index].shelf_name = getCascadeSelectedName(
        state.shelfList,
        action.selectedValue
      )
      details[action.index].shelf_id =
        action.selectedValue[action.selectedValue.length - 1]

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_IN_SHARE_ADD: {
      const share = [...state.inStockDetail.share]

      // 如果只有一个空行
      if (share.length === 1 && _.keys(share[0]).length === 0) {
        share[0] = action.share
      } else {
        share.push(action.share)
      }

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, { share }),
      })
    }

    case actionTypes.PRODUCT_IN_SHARE_DEL: {
      const share = [...state.inStockDetail.share]
      share.splice(action.index, 1)
      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, { share }),
      })
    }

    case actionTypes.PRODUCT_IN_DISCOUNT_ADD: {
      let { delta_money, discount } = state.inStockDetail

      // 如果只有一个空行
      if (discount.length === 1 && _.keys(discount[0]).length === 0) {
        discount[0] = action.discount
      } else {
        discount.push(action.discount)
      }
      // 实时更新折让金额
      if (+action.discount.action === 1) {
        delta_money = Big(delta_money).plus(action.discount.money).toFixed(2)
      } else if (+action.discount.action === 2) {
        delta_money = Big(delta_money).minus(action.discount.money).toFixed(2)
      }

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, {
          discount,
          delta_money,
        }),
      })
    }

    case actionTypes.PRODUCT_IN_DISCOUNT_DEL: {
      let { delta_money, discount } = state.inStockDetail

      // 实时更新折让金额
      if (discount.length) {
        if (+discount[action.index].action === 1) {
          delta_money = Big(delta_money)
            .minus(discount[action.index].money)
            .toFixed(2)
        } else if (+discount[action.index].action === 2) {
          delta_money = Big(delta_money)
            .plus(discount[action.index].money)
            .toFixed(2)
        }
      }

      discount.splice(action.index, 1)

      return Object.assign({}, state, {
        inStockDetail: Object.assign({}, state.inStockDetail, {
          discount,
          delta_money,
        }),
      })
    }

    // 出库
    case actionTypes.PRODUCT_OUT_STOCK_LIST:
      return Object.assign({}, state, {
        outStock: Object.assign({}, state.outStock, action, {
          loading: false,
        }),
      })

    case actionTypes.PRODUCT_OUT_STOCK_FILTER_CHANGE: {
      const filter = Object.assign({}, state.outStock.filter, {
        [action.name]: action.value,
      })

      return Object.assign({}, state, {
        outStock: Object.assign({}, state.outStock, {
          filter,
        }),
      })
    }

    case actionTypes.PRODUCT_OUT_STOCK_CLEAR:
      return Object.assign({}, state, {
        outStock: initState.outStock,
      })

    case actionTypes.PRODUCT_OUT_STOCK_OBJECT:
      return Object.assign({}, state, { outStockObject: action.outStockObject })

    case actionTypes.PRODUCT_OUT_STOCK_ID:
      return Object.assign({}, state, { outStockId: action.outStockId })

    case actionTypes.PRODUCT_OUT_STOCK_PRO_DETAIL_ADD: {
      const details = [...state.outStockDetail.details]
      details.push({})

      return Object.assign({}, state, {
        outStockDetail: Object.assign({}, state.outStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_OUT_STOCK_PRO_DETAIL_DEL: {
      const details = [...state.outStockDetail.details]
      details.splice(action.index, 1)

      return Object.assign({}, state, {
        outStockDetail: Object.assign({}, state.outStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_OUT_STOCK_DATE_CHANGE:
      return Object.assign({}, state, {
        outStockDetail: Object.assign({}, state.outStockDetail, {
          out_stock_time: action.date,
        }),
      })

    case actionTypes.PRODUCT_OUT_STOCK_DETAIL: {
      const { details } = action.data
      const outStockDetail = {
        ...action.data,
      }

      if (details.length === 0) {
        outStockDetail.details = [{}]
      }

      return Object.assign({}, state, { outStockDetail })
    }

    case actionTypes.PRODUCT_OUT_PRODUCT_NAME_SELECTED: {
      const details = [...state.outStockDetail.details]
      if (!details[action.index]) {
        details[action.index] = {}
      }

      if (action.selected) {
        details[action.index].name = action.selected.name
        details[action.index].id = action.selected.value
        details[action.index].category = action.selected.category
        // details[action.index].unit_price = action.selected['unit_price'];
        details[action.index].sale_unit_name = action.selected.sale_unit_name
        details[action.index].spu_id = action.selected.spu_id
        details[action.index].std_unit_name = action.selected.std_unit_name
        details[action.index].sale_ratio = action.selected.sale_ratio
        details[action.index].std_ratio = action.selected.std_ratio
      } else {
        details[action.index].name = null
        details[action.index].id = null
        details[action.index].category = null
        details[action.index].sale_unit_name = null
        details[action.index].spu_id = null
        details[action.index].std_unit_name = null
        details[action.index].sale_ratio = null
        details[action.index].std_ratio = null
      }

      return Object.assign({}, state, {
        outStockDetail: Object.assign({}, state.outStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_OUT_PRODUCT_QUANTITY_CHANGE: {
      const details = [...state.outStockDetail.details]
      if (!details[action.index]) {
        details[action.index] = {}
      }

      // 若已经选了出库批次，但再次修改出库数，则把所选批次清空，并且tips
      if (
        details[action.index].batch_details &&
        details[action.index].batch_details.length > 0
      ) {
        details[action.index].change = true
        details[action.index].batch_details = []
      }

      details[action.index].quantity = action.quantity
      details[action.index].real_std_count = Big(action.quantity || 0)
        .mul(details[action.index].sale_ratio || 0)
        .mul(details[action.index].std_ratio || 0)
        .toFixed(2) // 出库数基本单位
      return Object.assign({}, state, {
        outStockDetail: Object.assign({}, state.outStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_OUT_PRODUCT_BATCH_SELECTED: {
      // 记录用户选择的batch_num
      const details = [...state.outStockDetail.details]
      details[action.index].batch_details = action.batch_details
      details[action.index].hasEdit = true
      details[action.index].is_anomaly = false
      if (_.has(details[action.index], 'change'))
        details[action.index].change = false
      return Object.assign({}, state, {
        outStockDetail: Object.assign({}, state.outStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_OUT_STOCK_ANOMALY: {
      // 标记异常的列表，并把其batch_details清空
      const details = [...state.outStockDetail.details]
      _.forEach(details, (de) => {
        if (_.includes(action.anomaly, de.id)) {
          de.is_anomaly = true
          de.batch_details = []
        }
      })
      return Object.assign({}, state, {
        outStockDetail: Object.assign({}, state.outStockDetail, { details }),
      })
    }

    case actionTypes.PRODUCT_OUT_STOCK_SERVICE_TIME: {
      return Object.assign({}, state, {
        serviceTime: action.serviceTime,
      })
    }

    // 退货
    case actionTypes.PRODUCT_REFUND_LIST:
      return Object.assign({}, state, {
        refundStock: Object.assign({}, state.refundStock, action, {
          loading: false,
        }),
      })

    case actionTypes.PRODUCT_REFUND_STOCK_FILTER_CHANGE: {
      const filter = Object.assign({}, state.refundStock.filter, {
        [action.name]: action.value,
      })

      return Object.assign({}, state, {
        refundStock: Object.assign({}, state.refundStock, {
          filter,
        }),
      })
    }

    case actionTypes.PRODUCT_REFUND_STOCK_CLEAR:
      return Object.assign({}, state, {
        refundStock: Object.assign({}, initState.refundStock),
      })

    case actionTypes.PRODUCT_REFUND_DETAIL:
      return Object.assign({}, state, {
        refundStockDetail: action.refundStockDetail,
      })

    case actionTypes.PRODUCT_REFUND_STOCK_BATCH_IMPORT:
      return Object.assign({}, state, {
        refundStockBatchImportList: action.sheetData,
      })

    case actionTypes.PRODUCT_REFUND_PRODUCT_BATCH_SELECTED: {
      // 记录用户选择的batch_num
      const details = [...state.refundStockDetail.details]
      details[action.index].batch_number = action.batch_number
      details[action.index].selected_sum = action.selected_sum
      details[action.index].hasEdit = true
      return Object.assign({}, state, {
        refundStockDetail: Object.assign({}, state.refundStockDetail, {
          details,
        }),
      })
    }

    case actionTypes.PRODUCT_IN_SHELF_LIST: {
      return Object.assign({}, state, {
        shelfList: action.shelfList,
      })
    }

    // 表格选择
    case actionTypes.PRODUCT_REFUND_PRODUCT_LIST_SELECTED_CHANGE: {
      return Object.assign({}, state, {
        refundStock: Object.assign({}, state.refundStock, {
          refundListSelected: action.selected,
        }),
      })
    }

    // 全选当前页/全部页
    case actionTypes.PRODUCT_REFUND_PRODUCT_CURRENT_PAGE_SELECT_CHANGE: {
      return Object.assign({}, state, {
        refundStock: Object.assign({}, state.refundStock, {
          isAllPageSelect: action.isSelected,
        }),
      })
    }

    // 点击全选表格
    case actionTypes.PRODUCT_REFUND_PRODUCT_TABLE_ALL_SELECT_CHANGE: {
      let selected = []

      if (action.isSelected) {
        selected = _.map(state.refundStock.list, (v) => v.id)
      }

      return Object.assign({}, state, {
        refundStock: Object.assign({}, state.refundStock, {
          refundListSelected: selected,
        }),
      })
    }

    // 清空表格选择
    case actionTypes.PRODUCT_REFUND_PRODUCT_CLEAR_TABLE_SELECT: {
      return Object.assign({}, state, {
        refundStock: Object.assign({}, state.refundStock, {
          refundListSelected: [],
        }),
      })
    }

    // 获取采购退货打印数据
    case actionTypes.PRODUCT_REFUND_PRODUCT_PRINT_DETAIL: {
      return Object.assign({}, state, {
        refundStock: Object.assign({}, state.refundStock, {
          printList: action.refundPrintList,
        }),
      })
    }

    default:
      return state
  }
}

const storageOptions = {}
// 记住时间类型
storageOptions.product = {
  selector: [
    'refundStock.filter.type' /* 退货出库 日期类型 */,
    'inStock.filter.type' /* 成品入库 日期类型 */,
    'outStock.filter.type' /* 成品出库 日期类型 */,
  ],
  name: ACTION_STORAGE_KEY_NAMES.PRODUCT,
}

mapActionStorage(reducers, storageOptions)
mapReducers(reducers)
