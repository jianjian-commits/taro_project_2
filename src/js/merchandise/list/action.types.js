import actionTypes from '../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    MERCHANDISE_LIST_SEARCH: null,
    MERCHANDISE_LIST_CHANGE: null,
    MERCHANDISE_LIST_OPEN_TOGGLE: null,
    MERCHANDISE_LIST_OPEN_ALL_TOGGLE: null,
    MERCHANDISE_LIST_SKU_UPDATE: null,

    // clear filter data
    MERCHANDISE_LIST_CLEAR_FILTER: null,
    MERCHANDISE_LIST_CLEAR: null,

    MERCHANDISE_LIST_SPU_SELECT: null,
    MERCHANDISE_LIST_SPU_SELECT_ALL: null,
    MERCHANDISE_LIST_SKU_SELECT: null,
    MERCHANDISE_LIST_SMART_PRICE_NEXT: null,
    MERCHANDISE_LIST_GET_SALE_MENU_LIST: null,

    MERCHANDISE_LIST_SELECT_ALL_TYPE: null,
  })
)
