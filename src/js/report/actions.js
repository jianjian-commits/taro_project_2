import actionTypes from './action.types'
import { mapActions } from 'redux-async-actions-reducers'
import { Request } from '@gm-common/request'
import _ from 'lodash'
const actions = {}

actions.report_value_filter = (data = {}) => {
  return {
    type: actionTypes.REPORT_VALUE_FILTER,
    value_filter: data,
  }
}

actions.report_sku_categories = () => {
  return (dispatch) => {
    return Request('/station/skucategories')
      .get()
      .then((json) => {
        const categories = []
        _.forEach(json.data, (item) => {
          if (item.level === 1) {
            item.children = []
            item.name = item.title
            categories.push(item)
          }
        })
        _.forEach(json.data, (item) => {
          if (item.level === 2) {
            item.name = item.title
            const p = categories.find((p) => p.id === item.upstream_id)
            p.children && p.children.push(item)
          }
        })
        dispatch({
          type: actionTypes.REPORT_SKU_CATEGORIES,
          report_sku_categories: categories,
        })
        return json
      })
  }
}

actions.report_select_filter = (data = {}) => {
  return {
    type: actionTypes.REPORT_SELECT_FILTER,
    select_filter: data,
  }
}

actions.report_search_text = (data = '') => {
  return {
    type: actionTypes.REPORT_SEARCH_TEXT,
    search_text: data,
  }
}

actions.report_filter_pop_dimension = (data = {}) => {
  return {
    type: actionTypes.REPORT_FILTER_POP_DIMENSION,
    filter_pop_dimension: data,
  }
}

actions.report_value_data = (data = {}) => {
  return () => {
    return Request('/stock/report/value').data(data).get()
  }
}

actions.update_report_value_data = (data = {}) => {
  return (dispatch) => {
    const dataList = data
    dispatch({
      type: actionTypes.REPORT_VALUE_DATA,
      value_data: {
        dataList: dataList,
        loading: false,
      },
    })
  }
}

actions.reset_report_value_data = () => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.REPORT_VALUE_DATA,
      value_data: {
        dataList: [],
        loading: true,
      },
    })
  }
}

actions.report_sum_data = (data = {}) => {
  return () => {
    return Request('/stock/report/value/sum').data(data).get()
  }
}

actions.update_report_sum_data = (data = {}) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.REPORT_SUM_DATA,
      sum_data: {
        start_stock_value_sum: data.start_stock_value_sum || 0,
        end_stock_value_sum: data.end_stock_value_sum || 0,
        in_stock_value_sum: data.in_stock_value_sum || 0,
        out_stock_value_sum: data.out_stock_value_sum || 0,
      },
    })
  }
}

actions.value_list_export = (data) => {
  return () => {
    return Request('/stock/report/value_export').data(data).get()
  }
}

actions.report_unpay_filter = (data = {}) => {
  return {
    type: actionTypes.REPORT_UNPAY_FILTER,
    unpay_filter: data,
  }
}

actions.report_unpay_search_filter = (data = {}) => {
  return {
    type: actionTypes.REPORT_UNPAY_SEARCH_FILTER,
    unpay_search_filter: data,
  }
}

actions.report_unpay_data = (data = {}) => {
  return (dispatch) => {
    Request('/station/report/settlement')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.REPORT_UNPAY_DATA,
          unpay_data: {
            dataList: json.data,
            pagination: json.pagination,
          },
        })
      })
  }
}

actions.report_reset = () => {
  return {
    type: actionTypes.REPORT_RESET,
  }
}
mapActions(actions)
