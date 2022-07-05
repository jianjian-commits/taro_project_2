import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'
import Big from 'big.js'
import { getOverSuggestPrice } from '../util'
import globalStore from '../../stores/global'

const initListState = {
  filter: {
    category1_ids: [],
    category2_ids: [],
    pinlei_ids: [],
    salemenu_ids: [],
  },
  saleMenuList: [],
  query: '',
  isShowUnActive: true,
  formula: -1,
  list: [],
  isSelectAll: false,
  selectAllType: 1, // 1 当前页 2 所有页
  pagination: {
    count: 0,
    offset: 0,
    limit: 10,
  },

  smartPriceFilter: {
    // 不止限于以下几项
    price_type: 0,
    cal_type: 0,
    cal_num: 0,
  },
  smartPriceData: [],
  smartPricePagination: {},
}

const reducers = {}
reducers.merchandiseList = (state = initListState, action) => {
  switch (action.type) {
    case actionTypes.MERCHANDISE_LIST_CHANGE: {
      const s = state
      s[action.field] = action.data
      return Object.assign({}, s)
    }

    case actionTypes.MERCHANDISE_LIST_SEARCH: {
      _.forEach(action.data, (spu) => {
        _.forEach(spu.skus, (sku) => {
          if (sku.formula_info)
            sku.formula_info.cal_num = Big(sku.formula_info.cal_num)
              .div(100)
              .toFixed(sku.formula_info.cal_type === 1 ? 3 : 2)
        })
      })

      return Object.assign({}, state, {
        list: action.data || [],
        pagination: action.pagination,
      })
    }

    case actionTypes.MERCHANDISE_LIST_OPEN_TOGGLE: {
      const { list } = state
      list[action.index].__gm_expanded = !list[action.index].__gm_expanded
      return Object.assign({}, state, {
        list,
      })
    }

    case actionTypes.MERCHANDISE_LIST_OPEN_ALL_TOGGLE: {
      const { list } = state
      const isHasContract = _.find(list, (d) => !d.__gm_expanded)

      _.forEach(list, (v) => {
        v.__gm_expanded = isHasContract
      })

      return Object.assign({}, state, {
        list,
      })
    }

    case actionTypes.MERCHANDISE_LIST_SKU_UPDATE: {
      _.each(state.list, (value) => {
        _.each(value.skus, (v) => {
          if (v.sku_id === action.sku_id) {
            v[action.field] = action.value
            // 联动修改其他数据
            if (action.field === 'std_sale_price_forsale') {
              if (globalStore.otherInfo.showSuggestPrice) {
                // 如果修改了单价，且开了建议定价区间，则判断所改价格是否在建议定价区间内
                v.over_suggest_price = getOverSuggestPrice(
                  action.value,
                  v.suggest_price_min,
                  v.suggest_price_max
                )
              }
              v['sale_price'] = Math.round(action.value * v.sale_ratio)
            } else if (action.field === 'sale_price') {
              const price = Math.round(action.value / v.sale_ratio)
              if (globalStore.otherInfo.showSuggestPrice) {
                // 如果修改了销售价，且开了建议定价区间，则判断所对应的单价是否在建议定价区间内
                v.over_suggest_price = getOverSuggestPrice(
                  price,
                  v.suggest_price_min,
                  v.suggest_price_max
                )
              }

              v['std_sale_price_forsale'] = price
            }
          }
        })
      })
      return Object.assign({}, state)
    }
    case actionTypes.MERCHANDISE_LIST_CLEAR: {
      return Object.assign({}, state, {
        list: action.list,
        pagination: action.pagination,
      })
    }
    case actionTypes.MERCHANDISE_LIST_CLEAR_FILTER: {
      return Object.assign({}, state, {
        filter: action.filter,
        query: action.query,
        isShowUnActive: action.isShowUnActive,
        formula: action.formula,
      })
    }

    case actionTypes.MERCHANDISE_LIST_SPU_SELECT: {
      const { list } = state

      list[action.index] = Object.assign({}, list[action.index], {
        _gm_select: action.checked,
        skus: _.forEach(list[action.index].skus, (l) => {
          l._gm_select = action.checked
        }),
      })

      return Object.assign({}, state, {
        list,
        isSelectAll: !_.find(list, (l) => !l._gm_select),
        selectAllType: 1,
      })
    }

    case actionTypes.MERCHANDISE_LIST_SPU_SELECT_ALL: {
      const { list } = state

      return Object.assign({}, state, {
        list: _.forEach(list, (l) => {
          l._gm_select = action.checked
          l.skus = _.forEach(l.skus, (v) => {
            v._gm_select = action.checked
          })
        }),
        isSelectAll: action.checked,
      })
    }

    case actionTypes.MERCHANDISE_LIST_SKU_SELECT: {
      const { list } = state
      list[action.spu_index].skus[action.sku_index]._gm_select = action.checked

      // 判断是否选取了spu下所有的sku
      if (
        _.filter(list[action.spu_index].skus, (s) => s._gm_select).length ===
        list[action.spu_index].skus.length
      ) {
        list[action.spu_index]._gm_select = true
      } else {
        list[action.spu_index]._gm_select = false
      }

      return Object.assign({}, state, {
        list,
        isSelectAll: !_.find(list, (l) => !l._gm_select),
      })
    }

    case actionTypes.MERCHANDISE_LIST_SELECT_ALL_TYPE:
      return Object.assign({}, state, {
        selectAllType: action.val,
      })

    case actionTypes.MERCHANDISE_LIST_SMART_PRICE_NEXT: {
      // 记录请求信息和返回的sku_list 二次确认页面需要
      return Object.assign({}, state, {
        smartPriceFilter: action.filter,
        smartPriceData: action.data,
        smartPricePagination: action.pagination,
      })
    }
    case actionTypes.MERCHANDISE_LIST_GET_SALE_MENU_LIST: {
      return Object.assign({}, state, {
        saleMenuList: action.data,
      })
    }
    default:
      return state
  }
}

mapReducers(reducers)
