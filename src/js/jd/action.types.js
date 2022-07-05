import actionTypes from '../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    JD_GET_ORDERS: null,
    JD_UPDATE_PRE_CODE: null,
    JD_UPDATE_VALID_DAY: null,
  })
)
