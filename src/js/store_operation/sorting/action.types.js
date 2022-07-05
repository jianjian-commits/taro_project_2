import actionTypes from '../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    SORTING_GET_SERVICE_TIME: null,
    SORTING_GET_TASK_CYCLE: null,
    SORTING_CHANGE_CYCLE_SELECTED: null,
    SORTING_CHANGE_CONTAINER_OUTER: null,
    SORTING_GET_SORTING_LIST: null,
    SORTING_ACTIVE_THE_BATCH: null,
    SORTING_CHANGE_LOADING: null,

    SORTING_SELECT_FILTER_CHANGE: null,
    // 分拣进度
    SORTING_GET_SCHEDULE_SEARCH_DATA: null,

    // 分拣明细
    SORTING_MERCHANDISE_FILTER_GET_ALL: null,
    SORTING_DETAIL_FILTER: null,
    SORTING_DETAIL_GET_SALE_LIST: null,
    SORTING_BATCH_LIST_GET_ALL: null,
    SORTING_DETAIL_GET_ROUTE_LIST: null,
    SORTING_GET_DETAIL_SEARCH_DATA: null,
    SORTING_VIEW_SKU_LIST_SKU_SELECT: null,
    GET_FILTER_DATA: null,
  })
)
