import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { Request } from '@gm-common/request'
import { pennyToYuan } from '../util'
import { getQueryFilter, getBatchSkuFilter, getBatchSpuFilter } from './util'

const actions = {}

actions.merchandise_list_sku_update = (sku_id, field, value) => {
  return (dispatch) => {
    const data = { id: sku_id }

    // 传过来sku_name，是方便reducers更新store（不用重新拉数据）。
    // 但是后台的字段名是name
    if (field === 'sku_name') {
      data.name = value
    } else {
      data[field] = value
    }

    return Request('/product/sku/update')
      .data(data)
      .post()
      .then(() => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_SKU_UPDATE,
          sku_id,
          field,
          value,
        })
      })
  }
}

actions.merchandise_list_clear = () => {
  return {
    type: actionTypes.MERCHANDISE_LIST_CLEAR,
    list: [],
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
  }
}

actions.merchandise_list_clear_filter = () => {
  return {
    type: actionTypes.MERCHANDISE_LIST_CLEAR_FILTER,
    filter: {
      category1_ids: [],
      category2_ids: [],
      pinlei_ids: [],
      salemenu_ids: [],
    },
    query: '',
    isShowUnActive: true,
    formula: -1,
  }
}

actions.merchandise_list_change = (field, data) => {
  return {
    type: actionTypes.MERCHANDISE_LIST_CHANGE,
    field,
    data,
  }
}

actions.merchandise_list_search = (pagination = {}) => {
  return (dispatch, getState) => {
    return Request('/merchandise/spu/index')
      .data({
        ...getQueryFilter(getState().merchandiseList),
        offset: pagination.offset,
        limit: pagination.limit,
      })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_SEARCH,
          data: json.data,
          pagination: json.pagination,
        })
        return json.data || []
      })
  }
}

actions.merchandise_list_open_toggle = (index) => {
  return {
    type: actionTypes.MERCHANDISE_LIST_OPEN_TOGGLE,
    index,
  }
}

actions.merchandise_list_open_all_toggle = () => {
  return {
    type: actionTypes.MERCHANDISE_LIST_OPEN_ALL_TOGGLE,
  }
}

actions.merchandise_list_spu_select = (checked, index) => {
  return {
    type: actionTypes.MERCHANDISE_LIST_SPU_SELECT,
    checked,
    index,
  }
}

actions.merchandise_list_spu_select_all = (checked) => {
  return {
    type: actionTypes.MERCHANDISE_LIST_SPU_SELECT_ALL,
    checked,
  }
}

actions.merchandise_list_sku_select = (spu_index, checked, sku_index) => {
  return {
    type: actionTypes.MERCHANDISE_LIST_SKU_SELECT,
    spu_index,
    checked,
    sku_index,
  }
}

actions.merchandise_list_smart_price_next = (info) => {
  return (dispatch, getState) => {
    const { formula_type, price_region_min, price_region_max, cal_num } = info
    let data = getBatchSkuFilter(getState().merchandiseList)
    if (formula_type === 1) {
      data = Object.assign({}, data, { formula_type })
    } else if (formula_type === 2) {
      data = Object.assign({}, data, {
        ...info,
        price_region_min: pennyToYuan(price_region_min),
        price_region_max: pennyToYuan(price_region_max),
        cal_num: pennyToYuan(cal_num),
      })
    }
    else if (formula_type === 3) {
      data = Object.assign({}, data, { formula_type })
    }

    return Request('/product/sku/smart_pricing/list')
      .data(data)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_SMART_PRICE_NEXT,
          data: json.data,
          pagination: json.pagination,
          filter: data,
        })
        return json
      })
  }
}
actions.merchandise_list_get_sale_menu_list = () => {
  return (dispatch) => {
    return Request('/salemenu/list')
      .data({ type: 4, is_active: 1 })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_GET_SALE_MENU_LIST,
          data: json.data,
        })
        return json
      })
  }
}

actions.merchandise_batch_update_import = (import_file) => {
  return (dispatch, getState) => {
    return Request('/product/sku/batch_import_update')
      .data({ import_file })
      .post()
  }
}

actions.merchandise_list_export = () => {
  return (dispatch, getState) => {
    const params = getQueryFilter(getState().merchandiseList)
    return Request('/product/sku/export').data(params).get()
  }
}

// 设置定价公式
// info 定价公式详情 sku_id 单个sku_id
actions.merchandise_list_set_formula = (info, sku_id) => {
  return (dispatch, getState) => {
    const { price_region_min, price_region_max, cal_num } = info

    let data = getBatchSkuFilter(getState().merchandiseList, sku_id)
    data = Object.assign({}, data, {
      ...info,
      price_region_min: pennyToYuan(price_region_min),
      price_region_max: pennyToYuan(price_region_max),
      cal_num: pennyToYuan(cal_num),
    })
    return Request('/product/sku/smart_formula_pricing/update')
      .data(data)
      .post()
  }
}

actions.merchandise_list_select_all_type = (val) => {
  return {
    type: actionTypes.MERCHANDISE_LIST_SELECT_ALL_TYPE,
    val,
  }
}

// 批量删除sku
// 报价单和商品库的批量删除sku，后台共用一个接口，search_from区分： 1-报价单 2-商品库
actions.merchandise_list_sku_batch_delete = () => {
  return (dispatch, getState) => {
    const data = getBatchSkuFilter(getState().merchandiseList)
    data.search_from = 2

    return Request('/product/sku/batch_delete').data(data).post()
  }
}

// 批量删除spu
actions.merchandise_list_spu_batch_delete = () => {
  return (dispatch, getState) => {
    const data = getBatchSpuFilter(getState().merchandiseList)

    return Request('/merchandise/spu/batch_delete').data(data).post()
  }
}

mapActions(actions)
