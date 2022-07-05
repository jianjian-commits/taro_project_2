import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'

const initState = {
  categories: [], // 请自行在redux-tool下查看结构
  cate1Map: {},
  cate2Map: {},
  pinleiMap: {},

  // 只 CategoryPinLeiFilter 组件用
  // 存储的是分类的对象，非分类id
  // [[分类1, 分类1], ]
  categoryFilter: {
    one: [],
    two: [],
    pinLei: [],
  },
  reference_price_type: 1,

  loading: true,
}

let reducers = {}
reducers.merchandiseCommon = (state = initState, action) => {
  switch (action.type) {
    // todo 先留着
    case actionTypes.MERCHANDISE_COMMON_GET_ALL:
      return Object.assign({}, state, {
        categories: action.categories,
        cate1Map: action.cate1Map,
        cate2Map: action.cate2Map,
        pinleiMap: action.pinleiMap,
      })
    case actionTypes.MERCHANDISE_COMMON_GET_REFERENCE_PRICE_TYPE: {
      return Object.assign({}, state, {
        reference_price_type: action.data,
      })
    }
    case actionTypes.MERCHANDISE_COMMON_ADD_CATE1:
      return Object.assign({}, state, {
        categories: action.categories,
        cate1Map: action.cate1Map,
      })
    case actionTypes.MERCHANDISE_COMMON_UPDATE_CATE1:
      return Object.assign({}, state, { cate1Map: action.cate1Map })
    case actionTypes.MERCHANDISE_COMMON_DELETE_CATE1:
      return Object.assign({}, state, {
        categories: action.categories,
        cate1Map: action.cate1Map,
      })
    case actionTypes.MERCHANDISE_COMMON_ADD_CATE2:
      return Object.assign({}, state, {
        cate1Map: action.cate1Map,
        cate2Map: action.cate2Map,
      })
    case actionTypes.MERCHANDISE_COMMON_UPDATE_CATE2:
      return Object.assign({}, state, { cate2Map: action.cate2Map })
    case actionTypes.MERCHANDISE_COMMON_DELETE_CATE2:
      return Object.assign({}, state, {
        cate1Map: action.cate1Map,
        cate2Map: action.cate2Map,
      })
    case actionTypes.MERCHANDISE_COMMON_ADD_PINLEI:
      return Object.assign({}, state, {
        cate2Map: action.cate2Map,
        pinleiMap: action.pinleiMap,
      })
    case actionTypes.MERCHANDISE_COMMON_UPDATE_PINLEI:
      return Object.assign({}, state, { pinleiMap: action.pinleiMap })
    case actionTypes.MERCHANDISE_COMMON_DELETE_PINLEI:
      return Object.assign({}, state, {
        pinleiMap: action.pinleiMap,
        cate2Map: action.cate2Map,
      })
    default:
      return Object.assign({}, state)
  }
}

const initSkuCommonState = {
  sourceImg: {},
  skuSelected: '',
  skuList: [],
  skuLoading: true,

  skuDetail: {
    ingredients: [{ name: i18next.t('请选择物料'), attrition_rate: 0 }],
  }, // sku信息
  saleList: [], // 报价单列表
  supplyList: [], // 采购来源
  // supplyDetail: {}   // 采购来源信息
  ingredientList: [],
}

reducers.merchandiseSkuCommon = (state = initSkuCommonState, action) => {
  switch (action.type) {
    // 创建采购来源
    case actionTypes.MERCHANDISE_SKU_COMMON_SUPPLY_SKU_CREATE: {
      const supplyList = state.supplyList.slice()
      const skuDetail = state.skuDetail
      skuDetail.supply_sku = action.supplySku.sku_id
      supplyList.unshift(action.supplySku)
      return Object.assign({}, state, { supplyList, skuDetail })
    }
    case actionTypes.MERCHANDISE_SKU_COMMON_LOADING: {
      return Object.assign({}, state, {
        skuLoading: action.data,
      })
    }

    default:
      return Object.assign({}, state)
  }
}

mapReducers(reducers)
