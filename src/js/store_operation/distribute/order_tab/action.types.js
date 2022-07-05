import actionTypes from '../../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    DISTRIBUTE_ORDER_GET_SERVICE_TIME: null,
    DISTRIBUTE_ORDER_FILTER_CHANGE: null,
    DISTRIBUTE_ORDER_RESET_FILTER: null,
    DISTRIBUTE_ORDER_GET_DRIVER_LIST: null,
    DISTRIBUTE_ORDER_GET_ROUTE_LIST: null,
    DISTRIBUTE_ORDER_SELECT_DATE_TYPE: null,
    DISTRIBUTE_ORDER_DATE_PICKED: null,
    DISTRIBUTE_ORDER_SELECT_ROUTE: null,
    DISTRIBUTE_ORDER_SELECT_CARRIER_AND_DRIVER: null,
    DISTRIBUTE_ORDER_SELECT_AREA: null,
    DISTRIBUTE_ORDER_GET_ORDER_LIST: null,
    DISTRIBUTE_ORDER_LOADING_SET: null,

    DISTRIBUTE_ORDER_SAVE_ASSIGN: null,
    DISTRIBUTE_ORDER_AUTO_ASSIGN: null,

    DISTRIBUTE_ORDER_GET_PRINT_TEMPLATE: null,
    DISTRIBUTE_ORDER_SELECT_PRINT_TEMPLATE: null,

    DISTRIBUTE_BATCH_MODIFY_DRIVER: null,
    DISTRIBUTE_ORDER_CHANGE_SELECT_ALL_TYPE: null,
    DISTRIBUTE_ORDER_GET_SALEMENUS: null,

    DISTRIBUTE_ORDER_GET_LABELS: null,
    DISTRIBUTE_ORDER_GET_CREATE_USER: null,
    DISTRIBUTE_ORDER_CHANGE_LABEL: null,
    DISTRIBUTE_ORDER_CHANGE_SEARCH_TYPE: null,
    DISTRIBUTE_ORDER_CHANGE_SORT_TYPE: null,
  }),
)
