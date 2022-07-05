import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'
import globalStore from '../../stores/global'

const reducers = {}

const getstockDetailMatchList = () => {
  /**
   * 逻辑为：
   * 1.非净菜站点只有成品的概念，净菜站点分为原料和成品。对应关系为：净菜站点的原料对应非净菜站点的成品，也即是毛菜
   *   强调：净菜站点有毛菜和净菜，对于净菜站点来说毛菜即原料，净菜即成品
   * 2.以下判断是否是净菜站点原因如上，但是对于后台来说，这些都是毛菜商品。只是前端显示上要根据是否净菜站点区分。
   * 3.废弃 13， 15
   * */

  return [
    {
      id: 1,
      name: globalStore.isCleanFood()
        ? i18next.t('原料入库')
        : i18next.t('成品入库'),
    },
    {
      id: 2,
      name: globalStore.isCleanFood()
        ? i18next.t('原料入库审核不通过')
        : i18next.t('成品入库审核不通过'),
    },
    {
      id: 3,
      name: globalStore.isCleanFood()
        ? i18next.t('原料入库冲销')
        : i18next.t('成品入库冲销'),
    },
    {
      id: 4,
      name: globalStore.isCleanFood()
        ? i18next.t('原料出库')
        : i18next.t('成品出库'),
    },
    {
      id: 5,
      name: i18next.t('成品出库冲销'),
    },
    { id: 6, name: i18next.t('报损') },
    { id: 7, name: i18next.t('报溢') },
    {
      id: 8,
      name: globalStore.isCleanFood()
        ? i18next.t('原料退货')
        : i18next.t('成品退货'),
    },
    {
      id: 9,
      name: globalStore.isCleanFood()
        ? i18next.t('原料退货审核不通过')
        : i18next.t('成品退货审核不通过'),
    },
    {
      id: 10,
      name: globalStore.isCleanFood()
        ? i18next.t('原料退货冲销')
        : i18next.t('成品退货冲销'),
    },
    // 净菜
    {
      id: 11,
      name: i18next.t('净菜原料领料'),
    },
    {
      id: 12,
      name: i18next.t('净菜退货入库'),
    },
    // {
    //   id: 13,
    //   name: i18next.t('净菜半成品入库')
    // }, // 后台已废弃
    {
      id: 14,
      name: i18next.t('净菜成品入库'),
    },
    // {
    //   id: 15,
    //   name: i18next.t('净菜半成品领料')
    // }, // 后台已废弃
    {
      id: 16,
      name: i18next.t('净菜成品出库'),
    },

    // 这波改动是后台让根据后台的配对关系改的
    {
      id: 17,
      name: i18next.t('商品退货入库'),
    },
    {
      id: 18,
      name: i18next.t('库存均价修复'),
    },
    {
      id: 19,
      name: i18next.t('净菜成品领料'),
    },
    {
      id: 20,
      name: i18next.t('仓内移库移出'),
    },
    {
      id: 21,
      name: i18next.t('仓内移库移入'),
    },
    {
      id: 22,
      name: i18next.t('净菜原料退料'),
    },
    {
      id: 23,
      name: i18next.t('净菜成品退料'),
    },
    { id: 25, name: i18next.t('分割单入库') },
    { id: 26, name: i18next.t('分割单出库') },
    { id: 27, name: i18next.t('分割单冲销') },
    { id: 28, name: i18next.t('分割单冲销原料入库') },
    { id: 29, name: i18next.t('净菜成品入库冲销') },
    // { id: 30, name: i18next.t('') }, // 废弃
    { id: 31, name: i18next.t('修复出库均价') },
    // { id: 32, name: i18next.t('') }, // 废弃
    { id: 33, name: i18next.t('入库调整') },
    { id: 34, name: i18next.t('退货撤回') },
  ]
}

const initState = {
  searchOption: {
    begin: new Date(),
    end: new Date(),
    time_type: '2',
    category1: undefined,
    category2: undefined,
    time_config_id: '',
    text: '',
  },
  skuCategories: [],
  inventoryTabKey: 0,
  inventoryRecordTabKey: 0,
  inventoryProductManagementList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
    selectAllType: 1, // 当前页
    isSelectAll: false,
  },
  inventoryProductManagemenSum: {
    stock_value_sum: 0,
  },
  inventoryInStockList: {
    list: [],
    loading: false,
  },
  inventoryOutStockList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
  },
  inventoryRefundStockList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
  },
  giveUpPickUpList: {
    list: [],
    loading: false,
  },
  inventoryLossStockList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
  },
  inventoryIncreaseStockList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
  },
  inventoryReturnStockList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
  },
  inventoryBatchList: {
    list: [],
    loading: false,
  },
  inventoryBatchManagementList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
  },
  inventoryShelfManagementList: {
    list: [],
    loading: false,
    pagination: {
      offset: 0,
      limit: 10,
    },
  },
  inventoryShelfExportList: [
    { id: 'shelf_name', name: i18next.t('货位号') },
    { id: 'sku_id', name: i18next.t('入库规格ID') },
    { id: 'sku_name', name: i18next.t('入库规格名') },
    { id: 'remain_unit', name: i18next.t('库存数（基本单位）') },
    { id: 'ratio', name: i18next.t('入库规格') },
    { id: 'remain_purchase', name: i18next.t('库存数（采购单位）') },
  ],
  inventoryBatchExportList: [
    { id: 'batch_number', name: i18next.t('批次号') },
    { id: 'sku_id', name: i18next.t('入库规格ID') },
    { id: 'sku_name', name: i18next.t('入库规格名') },
    { id: 'remain_unit', name: i18next.t('库存数（基本单位）') },
    { id: 'ratio', name: i18next.t('入库规格') },
    { id: 'remain_purchase', name: i18next.t('库存数（采购单位）') },
    { id: 'price', name: i18next.t('批次库存均价') },
    { id: 'supplier_name', name: i18next.t('供应商信息') },
    { id: 'shelf_name', name: i18next.t('存放货位') },
    { id: 'production_time', name: i18next.t('生产日期') },
    { id: 'life_time', name: i18next.t('保质期') },
  ],
  changeRecord: {
    sku_id: '',
    sku_name: '',
    sale_ratio: '',
    std_unit_name: '',
    purchase_unit_name: '',
    data_list: [],
  },
  inventoryBatchExportChangeList: [
    { id: 'batch_number', name: i18next.t('批次号') },
    { id: 'sku_id', name: i18next.t('商品ID') },
    { id: 'sku_name', name: i18next.t('商品名') },
    { id: 'specification', name: i18next.t('商品规格') },
    { id: 'operate_time', name: i18next.t('操作时间') },
    { id: 'old_stock_number', name: i18next.t('变动前库存') },
    { id: 'now_stock_number', name: i18next.t('变动后库存') },
    { id: 'stock_detail', name: i18next.t('库存明细') },
  ],
  stockDetailMatchList: getstockDetailMatchList(),
  supplementList: [],
  serviceTimes: [],
  batchFilter: {
    begin: new Date(),
    end: new Date(),
    categoryFilter: {
      category1_ids: [],
      category2_ids: [],
      pinlei_ids: [],
    },
    exportType: 1,
    remaningType: 1,
  },
}

reducers.inventory = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.PRODUCT_INVENTORY_BATCH_FILTER_CHANGE:
      return Object.assign({}, state, { batchFilter: action.batchFilter })
    case actionTypes.PRODUCT_INVENTORY_SKU_CATEGORIES:
      return Object.assign({}, state, { skuCategories: action.skuCategories })
    case actionTypes.PRODUCT_INVENTORY_TAB_KEY:
      return Object.assign({}, state, {
        inventoryTabKey: action.inventoryTabKey,
      })
    case actionTypes.PRODUCT_INVENTORY_TAB_TO_BATCH: {
      return Object.assign({}, state, {
        inventoryTabKey: action.inventoryTabKey,
      })
    }
    case actionTypes.PRODUCT_INVENTORY_RECORD_TAB_KEY:
      return Object.assign({}, state, {
        inventoryRecordTabKey: action.inventoryRecordTabKey,
      })
    case actionTypes.PRODUCT_INVENTORY_PRODUCT_MANAGEMENT_LIST:
      return Object.assign({}, state, {
        inventoryProductManagementList: Object.assign(
          {},
          state.inventoryProductManagementList,
          {
            list: action.list,
            loading: false,
          },
        ),
      })
    case actionTypes.PRODUCT_INVENTORY_PRODUCT_MANAGEMENT_SUM:
      return Object.assign({}, state, {
        inventoryProductManagemenSum: Object.assign(
          {},
          state.inventoryProductManagemenSum,
          action.data,
        ),
      })
    case actionTypes.PRODUCT_INVENTORY_IN_STOCK_LIST:
      return Object.assign({}, state, {
        inventoryInStockList: {
          list: action.list,
          loading: false,
        },
      })
    case actionTypes.PRODUCT_INVENTORY_OUT_STOCK_LIST:
      return Object.assign({}, state, {
        inventoryOutStockList: {
          list: action.list,
          loading: false,
        },
      })
    case actionTypes.PRODUCT_INVENTORY_REFUND_STOCK_LIST:
      return Object.assign({}, state, {
        inventoryRefundStockList: {
          list: action.list,
          loading: false,
        },
      })
    case actionTypes.PRODUCT_INVENTORY_LOSS_STOCK_LIST:
      return Object.assign({}, state, {
        inventoryLossStockList: {
          list: action.list,
          loading: false,
        },
      })
    case actionTypes.PRODUCT_OUT_STOCK_FILTER_CHANGE: {
      const { name, value } = action
      const { searchOption } = state
      return Object.assign({}, state, {
        searchOption: { ...searchOption, [name]: value },
      })
    }

    case actionTypes.PRODUCT_OUT_STOCK_FILTER_RESET:
      return Object.assign({}, state, {
        searchOption: {
          begin: new Date(),
          end: new Date(),
          time_type: '2',
          category1: undefined,
          category2: undefined,
          time_config_id: '',
          text: '',
        },
      })

    case actionTypes.PRODUCT_INVENTORY_INCREASE_STOCK_LIST:
      return Object.assign({}, state, {
        inventoryIncreaseStockList: {
          list: action.list,
          loading: false,
        },
      })
    case actionTypes.PRODUCT_INVENTORY_RETURN_STOCK_LIST:
      return Object.assign({}, state, {
        inventoryReturnStockList: {
          list: action.list,
          loading: false,
        },
      })
    case actionTypes.PRODUCT_INVENTORY_BATCH_LIST:
      return Object.assign({}, state, {
        inventoryBatchList: {
          list: action.list,
          loading: false,
        },
      })
    case actionTypes.PRODUCT_INVENTORY_BATCH_SELECT: {
      const list = action.selected
      return Object.assign({}, state, {
        inventoryBatchList: Object.assign({}, state.inventoryBatchList, {
          list,
        }),
      })
    }
    // 安全库存
    case actionTypes.PRODUCT_INVENTORY_BATCH_CACHE:
      return Object.assign({}, state, {
        inventoryProductManagementList: Object.assign(
          {},
          state.inventoryProductManagementList,
          {
            list: action.list,
            loading: false,
          },
        ),
      })
    case actionTypes.PRODUCT_INVENTORY_BATCH_MANAGEMENT_LIST:
      return Object.assign({}, state, {
        inventoryBatchManagementList: Object.assign(
          {},
          state.inventoryBatchManagementList,
          {
            list: action.list,
            loading: false,
          },
        ),
      })
    case actionTypes.PRODUCT_INVENTORY_SHELF_MANAGEMENT_LIST:
      return Object.assign({}, state, {
        inventoryShelfManagementList: Object.assign(
          {},
          state.inventoryShelfManagementList,
          {
            list: action.list,
            loading: false,
          },
        ),
      })
    case actionTypes.PRODUCT_INVENTORY_SHELF_MANAGEMENT_EXPAND: {
      const shelfList = [...state.inventoryShelfManagementList.list]
      shelfList[action.index].__gm_expanded = !shelfList[action.index]
        .__gm_expanded

      return Object.assign({}, state, {
        inventoryShelfManagementList: Object.assign(
          {},
          state.inventoryShelfManagementList,
          { list: shelfList },
        ),
      })
    }
    case actionTypes.PRODUCT_INVENTORY_CHANGE_RECORD_LIST:
      return Object.assign({}, state, { changeRecord: action.changeRecord })
    case actionTypes.PRODUCT_INVENTORY_SUPPLEMENT_LIST:
      return Object.assign({}, state, { supplementList: action.supplementList })
    case actionTypes.PRODUCT_INVENTORY_SERVICE_TIME:
      return Object.assign({}, state, { serviceTimes: action.serviceTimes })

    case actionTypes.PRODUCT_INVENTORY_SELECT_PRODUCT: {
      const { inventoryProductManagementList } = state
      inventoryProductManagementList.list[action.spuId]._gm_select =
        action.checked
      inventoryProductManagementList.isSelectAll = !_.find(
        inventoryProductManagementList,
        (l) => !l._gm_select,
      )

      return Object.assign({}, state, {
        inventoryProductManagementList,
      })
    }

    case actionTypes.PRODUCT_INVENTORY_SELECT_ALL_PRODUCT: {
      const { inventoryProductManagementList } = state

      inventoryProductManagementList.list = _.forEach(
        inventoryProductManagementList.list,
        (l) => {
          l._gm_select = action.checked
          l.skus = _.forEach(l.skus, (v) => {
            v._gm_select = action.checked
          })
        },
      )

      inventoryProductManagementList.isSelectAll = action.checked

      return Object.assign({}, state, {
        inventoryProductManagementList,
      })
    }

    case actionTypes.PRODUCT_INVENTORY_SELECT_ALL_TYPE_PRODUCT: {
      const { inventoryProductManagementList } = state

      inventoryProductManagementList.selectAllType = action.selectAllType

      return Object.assign({}, state, { inventoryProductManagementList })
    }
    default:
      return state
  }
}
mapReducers(reducers)
