import actionTypes from '../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    // 车辆管理
    CAR_MANAGE_GET_CAB_MODEL_LIST: null,
    CAR_MANAGE_GET_CARRIER_LIST: null,
    CAR_MANAGE_ADD_CAB_MODEL: null,
    CAR_MANAGE_ADD_CARRIER: null,
    CAR_MANAGE_GET_DRIVER_LIST: null,
    CAR_MANAGE_CHECK_PHONE_NAME: null,
    CAR_MANAGE_ADD_DRIVER: null,
    CAR_MANAGE_RESET_PASSWD: null,
    CAR_MANAGE_UPDATE_DRIVER_PROFILE: null,
    // 线路管理
    ROUTE_MANAGE_GET_ROUTE_LIST: null,
    ROUTE_MANAGE_GET_EXPORT_DATA: null,
    ROUTE_MANAGE_GET_ROUTE_DETAIL: null,
    ROUTE_MANAGE_HEADER_FILTER_CHANGE: null,
    ROUTE_MANAGE_CHANGE_PAGINATION: null,
    // 搜索信息
    CAR_MANAGE_SET_DRIVER_SEARCH_TEXT: null,
    CAR_MANAGE_SET_CARRIER_SEARCH_TEXT: null,
    CAR_MANAGE_SET_CAR_MODEL_SEARCH_TEXT: null,
  })
)
