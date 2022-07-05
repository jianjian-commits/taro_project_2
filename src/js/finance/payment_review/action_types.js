import actionTypes from '../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    PAYMENT_REVIEW_TAB_KEY: null,
    PAYMENT_REVIEW_SUPPLY_GROUP: null,
    PAYMENT_REVIEW_SELECT_SUPPLIER: null,
    PAYMENT_REVIEW_SEARCH_TIME: null,
    PAYMENT_REVIEW_UNHANDLE_SHEET: null,
    PAYMENT_REVIEW_UNHANDLE_SHEET_SHOW_NUM: null,
    PAYMENT_REVIEW_UNHANDLE_SHEET_SELECTED: null,
    PAYMENT_REVIEW_SETTLE_SHEET: null,
    PAYMENT_REVIEW_SETTLE_SHEET_SHOW: null,
    PAYMENT_REVIEW_SETTLE_SHEET_SHOW_NUM: null,
    PAYMENT_REVIEW_CHANGE_TIME_TYPE: null,
    PAYMENT_REVIEW_CHANGE_RECEIPT_TYPE: null,
    PAYMENT_REVIEW_SETTLE_SHEET_DETAIL: null,
    PAYMENT_REVIEW_CHANGE_REMARK: null,
    PAYMENT_REVIEW_DISCOUNT_ADD: null,
    PAYMENT_REVIEW_DISCOUNT_DEL: null,
    PAYMENT_REVIEW_PRINT_SETTLE_SHEET_DETAIL: null,
  })
)
