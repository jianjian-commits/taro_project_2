import actionTypes from '../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    REPORT_VALUE_FILTER: null,
    REPORT_VALUE_DATA: null,
    REPORT_SUM_DATA: null,
    REPORT_UNPAY_FILTER: null,
    REPORT_UNPAY_SEARCH_FILTER: null,
    REPORT_UNPAY_DATA: null,
    REPORT_SKU_CATEGORIES: null,
    REPORT_SELECT_FILTER: null,
    REPORT_FILTER_POP_DIMENSION: null,
    REPORT_SEARCH_TEXT: null,
    REPORT_RESET: null,
  })
)
