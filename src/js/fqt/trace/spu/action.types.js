import actionTypes from '../../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    FQT_SPU_RECEIVE: null,
    FQT_SPU_GET: null,
    FQT_SPU_DEL_SUCC: null,
    FQT_UPLOAD_SUCC: null,
    FQT_UPLOAD_SHOW: null,
    FQT_UPLOAD_HIDE: null,
  })
)
