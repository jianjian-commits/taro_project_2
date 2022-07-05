import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types.js'
import { Request } from '@gm-common/request'
import { DBActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../../common/action_storage_key_names'
import { getOrderTypeId } from '../../../common/deal_order_process'

import utils from '../util'

const { setQueryTime } = utils

const actions = {}

actions.distribute_driver_get_driver_task_list = (nowPagination = {}) => {
  return (dispatch, getState) => {
    const { distributeDriver } = getState()

    const {
      date_type,
      time_config_id,
      pagination,
      begin_time,
      end_time,
      selected_carrier,
      service_times,
      orderType,
    } = distributeDriver

    let query = {
      carrier_id: (selected_carrier && selected_carrier.value) || null,
    }

    query = setQueryTime(
      query,
      date_type,
      time_config_id,
      begin_time,
      end_time,
      service_times,
    )

    const order_process_type_id = getOrderTypeId(orderType)
    if (order_process_type_id !== null) {
      query = {
        ...query,
        order_process_type_id,
      }
    }

    Object.assign(query, pagination, nowPagination)

    return Request('/station/task/distribute/driver_tasks/get')
      .data(query)
      .get()
      .then((json) => {
        const _pagination = {
          ...json.pagination,
        }
        dispatch({
          type: actionTypes.DISTRIBUTE_DRIVER_GET_DRIVER_TASK_LIST,
          data: json.data,
          pagination: _pagination,
        })
        return json
      })
  }
}

actions.distribute_driver_get_driver_order_list = (
  order_ids,
  nowPagination = {},
) => {
  return (dispatch, getState) => {
    const { distributeDriver } = getState()
    const {
      driverOrder: { pagination },
    } = distributeDriver

    const query = {
      order_ids: JSON.stringify(order_ids),
    }

    Object.assign(query, pagination, nowPagination)

    return Request('/station/task/distribute/orders/get')
      .data(query)
      .post()
      .then((json) => {
        const _pagination = {
          ...json.pagination,
          limit: 10,
        }
        dispatch({
          type: actionTypes.DISTRIBUTE_DRIVER_GET_DRIVER_ORDER_LIST,
          data: json.data,
          pagination: _pagination,
        })
      })
  }
}

// 司机任务列表 order列表 多个列表
actions.distribute_driver_get_driver_order_list_task = (
  order_ids,
  nowPagination = {},
  index,
) => {
  return (dispatch, getState) => {
    const { distributeDriver } = getState()
    const {
      driverOrder: { paginationTask },
    } = distributeDriver

    const query = {
      order_ids: JSON.stringify(order_ids),
    }
    const pagination = paginationTask[index]
    Object.assign(query, pagination, nowPagination)

    return Request('/station/task/distribute/orders/get')
      .data(query)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.DISTRIBUTE_DRIVER_GET_DRIVER_ORDER_LIST_TASK,
          data: json.data,
          pagination: json.pagination,
          index,
        })
        dispatch(actions.set_driver_order_task_list_loading(false))
      })
  }
}

actions.distribute_driver_get_print_template = () => {
  return (dispatch) => {
    return Request('/station/distribute_config/get')
      .get()
      .then((json) => {
        const number = json.data.length ? json.data.length : 1
        dispatch({
          type: actionTypes.DISTRIBUTE_DRIVER_GET_PRINT_TEMPLATE,
          data: number,
        })
      })
  }
}

actions.distribute_driver_select_print_template = (value) => {
  return {
    type: actionTypes.DISTRIBUTE_DRIVER_SELECT_PRINT_TEMPLATE,
    value,
  }
}

actions.set_driver_order_task_list_selected = (selected) => {
  return {
    type: actionTypes.DRIVER_ORDER_TASK_LIST_SELECTED,
    selectedDriverOrderTaskList: selected,
  }
}

actions.set_driver_order_task_list_loading = (loading) => {
  return {
    type: actionTypes.DRIVER_ORDER_TASK_LIST_LOADING,
    isLoading: loading,
  }
}

actions.select_driver_order_task_list_all_page = (select) => {
  return {
    type: actionTypes.DRIVER_ORDER_TASK_LIST_SELECT_ALL_PAGE,
    isSelectAllPage: select,
  }
}

actions.distribute_driver_clean_driver_order_list = () => {
  return {
    type: actionTypes.DISTRIBUTE_DRIVER_CLEAN_DRIVER_ORDER_LIST,
  }
}

actions.distribute_driver_filter_change = (filterObj) => {
  // 更新 local 服务时间
  const { time_config_id } = filterObj
  if (time_config_id) {
    DBActionStorage.set(
      ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_DRIVER_TIME,
      time_config_id,
    )
  }
  return {
    type: actionTypes.DISTRIBUTE_DRIVER_FILTER_CHANGE,
    filterObj,
  }
}

// 初始化服务时间(从司机订单中拿数据,而免得再次ajax请求)
actions.distribute_driver_initial_service_times = () => {
  return (dispatch, getState) => {
    const { service_times } = getState().distributeOrder
    // 从 local 取服务时间
    const time_config_id = DBActionStorage.get(
      ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_DRIVER_TIME,
    )
    const { initServiceTimeId } = DBActionStorage.helper
    const curId = getState().distributeDriver.time_config_id
    dispatch({
      type: actionTypes.DISTRIBUTE_DRIVER_INITIAL_SERVICE_TIMES,
      service_times,
    })
    initServiceTimeId(curId, time_config_id, service_times, (val) => {
      const filterObj = { time_config_id: val }
      dispatch(actions.distribute_driver_filter_change(filterObj))
    })
  }
}

actions.distribute_driver_select_date_type = (dateType) => {
  return {
    type: actionTypes.DISTRIBUTE_DRIVER_SELECT_DATE_TYPE,
    dateType,
  }
}

actions.distribute_driver_date_picked = (begin_time, end_time) => {
  return {
    type: actionTypes.DISTRIBUTE_DRIVER_DATE_PICKED,
    begin_time,
    end_time,
  }
}

actions.distribute_driver_selected_carrier = (selected_carrier) => {
  return {
    type: actionTypes.DISTRIBUTE_DRIVER_SELECTED_CARRIER,
    selected_carrier,
  }
}

// 司机任务获取订单商品明细列表
actions.driver_task_get_product_data = (order_id) => {
  return (dispatch) => {
    return Request('/station/task/distribute/orders/products/get')
      .data({ order_id })
      .get()
      .then((res) => {
        const data = res.data
        dispatch({
          type: actionTypes.DRIVER_TASK_GET_PRODUCT_DATA,
          data,
        })
      })
  }
}

actions.driver_task_set_product_pagination = (data) => {
  return {
    type: actionTypes.DRIVER_TASK_SET_PRODUCT_PAGINATION,
    data,
  }
}
actions.distribute_edit_deliver_order = (body) => {
  return (dispatch, getState) => {
    return Request('/station/task/distribute/edit_delivery_order')
      .data(body)
      .post()
  }
}
mapActions(actions)
