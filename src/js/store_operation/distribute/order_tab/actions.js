import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types.js'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import utils from '../util'
import { DBActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../../common/action_storage_key_names'
import { i18next } from 'gm-i18n'

const { getOrderParams } = utils

const actions = {}

actions.distribute_order_loading_set = (bool) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_LOADING_SET,
    isLoading: bool,
  }
}

actions.distribute_order_get_salemenus = () => {
  return (dispatch) => {
    Request('/station/salemenu/')
      .data({ json: 1 })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_SALEMENUS,
          data: json.data,
        })
      })
  }
}

actions.distribute_order_get_service_time = () => {
  return (dispatch, getState) => {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const serviceTimes = json.data
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_SERVICE_TIME,
          data: json.data,
        })
        const time_config_id = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_ORDER_TIME,
        )
        const { initServiceTimeId } = DBActionStorage.helper
        const curId = getState().distributeOrder.time_config_id
        // 初始化运营时间
        initServiceTimeId(curId, time_config_id, serviceTimes, (val) => {
          const filterObj = { time_config_id: val }
          dispatch(actions.distribute_order_filter_change(filterObj))
        })
      })
  }
}

actions.distribute_order_get_driver_list = () => {
  return (dispatch) => {
    return Request('/station/task/distribute/get_drivers')
      .data()
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_DRIVER_LIST,
          data: json.data,
        })
      })
  }
}

// 获取线路列表
actions.distribute_order_get_route_list = (query = { limit: 1000 }) => {
  return (dispatch) => {
    return Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_ROUTE_LIST,
          routeList: json.data || [],
        })
      })
  }
}

actions.distribute_order_save_assign = (query) => {
  return (dispatch) => {
    return Request('/station/task/distribute/edit_assign')
      .data(query)
      .post()
      .then(() => {
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_SAVE_ASSIGN,
        })
      })
  }
}

actions.distribute_order_auto_assign = (query) => {
  return (dispatch) => {
    return Request('/station/task/distribute/auto_assign')
      .data(query)
      .post()
      .then(() => {
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_AUTO_ASSIGN,
        })
      })
  }
}

actions.distribute_order_get_all_order_list = () => {
  return (dispatch, getState) => {
    // 表格loading
    dispatch(actions.distribute_order_loading_set(true))
    const query = getOrderParams(getState().distributeOrder)

    const pagination = { offset: 0, limit: 999999 }
    Object.assign(query, pagination)

    return Request('/station/task/distribute/orders/get')
      .data(query)
      .post()
      .then((json) => {
        dispatch(actions.distribute_order_loading_set(false))
        return json.data.order
      })
  }
}

actions.distribute_edit_deliver_order = (body) => {
  return (dispatch, getState) => {
    return Request('/station/task/distribute/edit_delivery_order')
      .data(body)
      .post()
  }
}

actions.distribute_order_get_order_list = (nowQuery = {}) => {
  return (dispatch, getState) => {
    // 表格loading
    dispatch(actions.distribute_order_loading_set(true))

    const distributeOrder = getState().distributeOrder
    const query = getOrderParams(distributeOrder)
    const { count, ...rest } = distributeOrder.pagination

    // 分页数据的处理有两种：回到当前页、回到第一页
    // 除单个或批量修改司机、智能规划，是回到当前页，其他情况均回到第一页
    Object.assign(query, { ...rest }, nowQuery)

    return Request('/station/task/distribute/orders/get')
      .data(query)
      .post()
      .then((json) => {
        const _pagination = {
          ...json.pagination,
        }
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_ORDER_LIST,
          data: json.data,
          pagination: _pagination,
        })

        dispatch(actions.distribute_order_loading_set(false))
        return json
      })
  }
}

actions.distribute_order_get_print_template = () => {
  return (dispatch) => {
    return Request('/station/distribute_config/get')
      .get()
      .then((json) => {
        const number = json.data.length ? json.data.length : 1
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_PRINT_TEMPLATE,
          data: number,
        })
      })
  }
}

actions.distribute_order_select_print_template = (value) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_SELECT_PRINT_TEMPLATE,
    value,
  }
}

actions.distribute_order_filter_change = (filterObj) => {
  // 更新 local 服务时间
  const { time_config_id } = filterObj
  if (time_config_id) {
    DBActionStorage.set(
      ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_ORDER_TIME,
      time_config_id,
    )
  }
  return {
    type: actionTypes.DISTRIBUTE_ORDER_FILTER_CHANGE,
    filterObj,
  }
}

actions.distribute_order_select_date_type = (dateType) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_SELECT_DATE_TYPE,
    dateType,
  }
}

actions.distribute_order_date_picked = (begin_time, end_time) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_DATE_PICKED,
    begin_time,
    end_time,
  }
}

actions.distribute_order_select_route = (route_id) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_SELECT_ROUTE,
    route_id,
  }
}

actions.distribute_order_select_carrier_and_driver = (
  carrier_id_and_driver_id,
) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_SELECT_CARRIER_AND_DRIVER,
    carrier_id_and_driver_id,
  }
}

actions.distribute_order_select_area = (area_id) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_SELECT_AREA,
    area_id,
  }
}

actions.distribute_order_change_select_all_type = (selectAllType) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_CHANGE_SELECT_ALL_TYPE,
    selectAllType,
  }
}

actions.distribute_get_pick_up_list = () => {
  return (dispatch) => {
    return Request('/station/pick_up_station/list')
      .data({ limit: 0 })
      .get()
      .then((json) => {
        const filterObj = {
          pickUpList: _.map(json.data, (item) => {
            return { value: item.id, text: item.name }
          }),
        }
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_FILTER_CHANGE,
          filterObj,
        })
      })
  }
}

actions.distribute_batch_modify_driver = (params) => {
  return (dispatch, getState) => {
    const {
      order_ids,
      operation_type,
      assign_driver_id,
      selectAllType,
    } = params

    // selectAllType: 1 当前页全选 传ids, 2 所有页全选 传搜索条件
    const query =
      selectAllType === 2
        ? {
            ...getOrderParams(getState().distributeOrder),
            operation_type,
            assign_driver_id,
          }
        : {
            order_ids,
            operation_type,
            assign_driver_id,
          }

    return Request('/station/task/distribute/edit_assign/v2').data(query).post()
  }
}

actions.distribute_order_reset_filter = () => ({
  type: actionTypes.DISTRIBUTE_ORDER_RESET_FILTER,
})

actions.distribute_order_get_labels = () => {
  return (dispatch) => {
    return Request('/station/address_label/list')
      .data({ limit: 1000 })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_LABELS,
          labelList: [{ text: i18next.t('无商户标签'), value: -1 }].concat(
            json.data.map((v) => ({ text: v.name, value: v.id })),
          ),
        })
      })
  }
}

actions.distribute_order_change_label = (selectedLabel) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_CHANGE_LABEL,
    selectedLabel,
  }
}

actions.distribute_order_get_labels_create_user = () => {
  return (dispatch) => {
    return Request('/gm_account/station/user/search')
      .data({ offset: 0, limit: 999 })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.DISTRIBUTE_ORDER_GET_CREATE_USER,
          createUserList: _.map(json.data.users, (v) => ({
            text: v.username,
            value: v.id,
          })),
        })
      })
  }
}

actions.distribute_order_change_search_type = (searchType) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_CHANGE_SEARCH_TYPE,
    searchType,
  }
}

actions.distribute_order_change_sort_type = (field) => {
  return {
    type: actionTypes.DISTRIBUTE_ORDER_CHANGE_SORT_TYPE,
    field,
  }
}

mapActions(actions)
