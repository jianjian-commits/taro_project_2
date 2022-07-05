import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types.js'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const actions = {}

//= ==================
//= =====车辆管理=======
//= ==================
actions.car_manage_get_cab_model_list = () => {
  return (dispatch, getState) => {
    const {
      carManage: {
        headerFilter: { carModelSearchText },
      },
    } = getState()

    return Request('/station/car_model/list')
      .data({ q: carModelSearchText })
      .get()
      .then((json) => {
        const data = json.data
        dispatch({
          type: actionTypes.CAR_MANAGE_GET_CAB_MODEL_LIST,
          cabModelList: data || [],
        })
      })
  }
}

actions.car_manage_add_cab_model = (cabModelMessage) => {
  const query = {
    car_model_name: cabModelMessage.cabName,
    max_load: cabModelMessage.maxLoad,
  }
  return (dispatch) => {
    return Request('/station/car_model/create')
      .data(query)
      .post()
      .then(() => {
        dispatch({
          type: actionTypes.CAR_MANAGE_ADD_CAB_MODEL,
        })
      })
  }
}

actions.car_manage_get_carrier_list = () => {
  return (dispatch, getState) => {
    const {
      carManage: {
        headerFilter: { carrierSearchText },
      },
    } = getState()

    return Request('/station/carrier/list')
      .data({ q: carrierSearchText })
      .get()
      .then((json) => {
        const data = json.data
        dispatch({
          type: actionTypes.CAR_MANAGE_GET_CARRIER_LIST,
          carrierList: data || [],
        })
      })
  }
}

actions.car_manage_add_carrier = (company_name) => {
  return (dispatch) => {
    return Request('/station/carrier/create')
      .data({ company_name })
      .post()
      .then(() => {
        dispatch({
          type: actionTypes.CAR_MANAGE_ADD_CARRIER,
        })
      })
  }
}

actions.car_manage_check_phone_name = (phone, name) => {
  const query = {
    phone,
    name,
  }

  return (dispatch) => {
    return Request('/station/check_phone_name/')
      .data(query)
      .get()
      .then(() => {
        dispatch({
          type: actionTypes.CAR_MANAGE_CHECK_PHONE_NAME,
        })
      })
  }
}

actions.car_manage_get_driver_list = (query) => {
  const newQuery = {
    time_config_id: query.timeConfigId,
    limit: query.limit,
    offset: query.offset,
  }

  return (dispatch, getState) => {
    // 搜索信息
    const {
      carManage: {
        headerFilter: { driverSearchText },
      },
    } = getState()

    return Request('/station/driver/list')
      .data({ ...newQuery, q: driverSearchText })
      .get()
      .then((json) => {
        const data = json.data
        const pagination = json.pagination
        dispatch({
          type: actionTypes.CAR_MANAGE_GET_DRIVER_LIST,
          driverList: data || [],
          pagination: pagination || {},
        })
      })
  }
}

// 线路管理
// 获取线路列表
actions.route_manage_get_route_list = (query) => {
  return (dispatch) => {
    return Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.ROUTE_MANAGE_GET_ROUTE_LIST,
          routeList: json.data || [],
        })
        return json // 返回 json 给分页组件
      })
  }
}

actions.route_manage_change_pagination = (data) => {
  return {
    type: actionTypes.ROUTE_MANAGE_CHANGE_PAGINATION,
    data,
  }
}

// 获取导出数据
actions.route_manage_get_export_data = (query) => {
  return (dispatch) => {
    return Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.ROUTE_MANAGE_GET_EXPORT_DATA,
          exportData: json.data || [],
        })
      })
  }
}

// 搜索条件更新
actions.route_manage_header_filter_change = (data) => {
  return {
    type: actionTypes.ROUTE_MANAGE_HEADER_FILTER_CHANGE,
    data,
  }
}

// 新增线路
actions.route_manage_create_route = (query) => {
  return () => {
    return Request('station/address_route/create')
      .data(query)
      .post()
      .then((json) => {
        return json
      })
  }
}

// 修改线路
actions.route_manage_update_route = (query) => {
  return () => {
    return Request('station/address_route/update')
      .data(query)
      .post()
      .then((json) => {
        return json
      })
  }
}

// 删除线路
actions.route_manage_delete_route = (query) => {
  return () => {
    return Request('station/address_route/delete')
      .data(query)
      .post()
      .then((json) => {
        return json
      })
  }
}

// 获取线路详情
actions.route_manage_get_route_detail = (query) => {
  return (dispatch) => {
    return Request('station/address_route/get')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.ROUTE_MANAGE_GET_ROUTE_DETAIL,
          routesDetail: json.data || [],
        })
        return json.data || []
      })
  }
}

// 删除司机
actions.car_manage_delete_driver = (id) => {
  return () => {
    return Request('/station/driver/delete').data({ id }).post()
  }
}

// 删除承运商
actions.car_manage_delete_carrier = (id) => {
  return () => {
    return Request('/station/carrier/delete').data({ id }).post()
  }
}

// 修改承运商
actions.car_manage_update_carrier = ({ carrier_id, company_name }) => {
  return () => {
    return Request('/station/carrier/update')
      .data({ carrier_id, company_name })
      .post()
  }
}

// 删除车型
actions.car_manage_delete_car_model = (id) => {
  return () => {
    return Request('/station/car_model/delete').data({ id }).post()
  }
}

// 修改车型
actions.car_manage_update_car_model = ({
  car_model_id,
  car_model_name,
  max_load,
}) => {
  return () => {
    if (max_load) max_load = +max_load
    return Request('/station/car_model/update')
      .data({ car_model_id, car_model_name, max_load })
      .post()
  }
}

actions.car_manage_set_driver_search_text = (q) => {
  return {
    type: actionTypes.CAR_MANAGE_SET_DRIVER_SEARCH_TEXT,
    q,
  }
}

actions.car_manage_set_carrier_search_text = (q) => {
  return {
    type: actionTypes.CAR_MANAGE_SET_CARRIER_SEARCH_TEXT,
    q,
  }
}

actions.car_manage_set_car_model_search_text = (q) => {
  return {
    type: actionTypes.CAR_MANAGE_SET_CAR_MODEL_SEARCH_TEXT,
    q,
  }
}

actions.update_data_list = ({ op, type, value, key, index }) => {
  return (dispatch, getState) => {
    const {
      carManage: { carrierList, cabModelList },
      routeManage: { routeList },
    } = getState()

    let list = routeList.slice()
    let _type = actionTypes.ROUTE_MANAGE_GET_ROUTE_LIST
    if (type === 'carrier') {
      list = carrierList.slice()
      _type = actionTypes.CAR_MANAGE_GET_CARRIER_LIST
    } else if (type === 'car_modal') {
      list = cabModelList.slice()
      _type = actionTypes.CAR_MANAGE_GET_CAB_MODEL_LIST
    }

    const _editObj = list[index]._editObj || {}
    let isEdting = list[index].isEdting || true
    if (op === 'update') {
      isEdting = true
      _editObj[key] = value
    } else {
      _.each(key, (_key) => {
        _editObj[_key] = list[index][_key]
        isEdting = false
      })
    }

    list[index] = {
      ...list[index],
      isEdting,
      _editObj,
    }

    if (type === 'carrier') {
      return dispatch({
        type: _type,
        carrierList: list,
      })
    } else if (type === 'car_modal') {
      return dispatch({
        type: _type,
        cabModelList: list,
      })
    } else {
      return dispatch({
        type: _type,
        routeList: list,
      })
    }
  }
}

mapActions(actions)
