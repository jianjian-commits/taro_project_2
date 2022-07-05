import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import moment from 'moment'

let defaultDate = moment().startOf('day')

let reducers = {}

const initState = {
  value_filter: {
    begin: defaultDate,
    end: defaultDate,
  },
  select_filter: {
    category1_ids: [],
    category2_ids: [],
  },
  value_data: {
    loading: true,
    dataList: [],
  },
  sum_data: {
    start_stock_value_sum: 0,
    end_stock_value_sum: 0,
    in_stock_value_sum: 0,
    out_stock_value_sum: 0,
  },
  unpay_filter: {
    begin: defaultDate,
    end: defaultDate,
  },
  unpay_search_filter: {
    begin: defaultDate,
    end: defaultDate,
  },
  unpay_data: {
    dataList: [],
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
  },
  search_text: '',
  report_sku_categories: [],
  filter_pop_dimension: {
    selectedValue: 'spu',
    list: [
      {
        value: 'spu',
        name: i18next.t('商品分类'),
      },
      {
        value: 'category_1',
        name: i18next.t('一级分类'),
      },
      {
        value: 'category_2',
        name: i18next.t('二级分类'),
      },
    ],
  },
}

reducers.report = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.REPORT_VALUE_FILTER:
      return Object.assign({}, state, { value_filter: action.value_filter })

    case actionTypes.REPORT_VALUE_DATA:
      return Object.assign({}, state, { value_data: action.value_data })

    case actionTypes.REPORT_SUM_DATA:
      return Object.assign({}, state, { sum_data: action.sum_data })

    case actionTypes.REPORT_UNPAY_FILTER:
      return Object.assign({}, state, { unpay_filter: action.unpay_filter })

    case actionTypes.REPORT_UNPAY_SEARCH_FILTER:
      return Object.assign({}, state, {
        unpay_search_filter: action.unpay_search_filter,
      })

    case actionTypes.REPORT_UNPAY_DATA:
      return Object.assign({}, state, { unpay_data: action.unpay_data })

    case actionTypes.REPORT_SKU_CATEGORIES:
      return Object.assign({}, state, {
        report_sku_categories: action.report_sku_categories,
      })

    case actionTypes.REPORT_SELECT_FILTER:
      return Object.assign({}, state, { select_filter: action.select_filter })

    case actionTypes.REPORT_FILTER_POP_DIMENSION:
      return Object.assign({}, state, {
        filter_pop_dimension: {
          list: state.filter_pop_dimension.list,
          selectedValue: action.filter_pop_dimension,
        },
      })

    case actionTypes.REPORT_SEARCH_TEXT:
      return Object.assign({}, state, { search_text: action.search_text })

    case actionTypes.REPORT_RESET:
      return Object.assign({}, state, {
        search_text: '',
        value_filter: {
          begin: defaultDate,
          end: defaultDate,
        },
        select_filter: {
          category1_ids: [],
          category2_ids: [],
        },
      })

    default:
      return state
  }
}

mapReducers(reducers)
