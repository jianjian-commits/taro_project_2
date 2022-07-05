import actionTypes from '../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    SUPPLIER_LIST: null,
    SUPPLIER_CATEGORY1: null,
    SUPPLIER_CATEGORY2: null,
    SUPPLIER_PINLEI: null,
    SUPPLIER_INFO: null,
    SUPPLIER_CHANGE_INFO: null,
    PURCHASE_SPECIFICATION_LIST: null,
    PURCHASE_SPECIFICATION_INFO: null,
    SUPPLIER_SPU: null,
    SUPPLIER_SHOW_PURCHASE_SPEC: null,
    SUPPLIER_PICS: null,
    PURCHASER_LIST: null,
    SUPPLIER_BATCH_IMPORT: null,
    PURCHASE_SHELF_LIST: null,
    PURCHASE_TABLE_SELECT: null,
    PURCHASE_TABLE_ALL_SELECT: null,
    PURCHASE_TABLE_ALL_PAGE_SELECT: null,
    PURCHASE_SET_BATCH_DEFAULT_SHELF: null,
    SUPPLIER_STATIONS: null,
  }),
)
