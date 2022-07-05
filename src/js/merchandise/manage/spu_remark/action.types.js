import actionTypes from '../../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    SPU_REMARK_CUSTOMER_SEARCH_LOADING: null,
    SPU_REMARK_CUSTOMER_SEARCH_GET: null,
    SPU_REMARK_CUSTOMER_SEARCH_ERROR: null,

    SPU_REMARK_PRODUCT_SEARCH_LOADING: null,
    SPU_REMARK_PRODUCT_SEARCH_GET: null,
    SPU_REMARK_SPU_EDITABLE: null,
    SPU_REMARK_SPU_REMARK_CHANGE: null,
    SPU_REMARK_SPU_REMARK_UPDATE: null,
    SPU_REMARK_SPU_REMARK_CANCEL: null,
  })
)
