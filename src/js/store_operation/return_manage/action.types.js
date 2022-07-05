import actionTypes from '../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    RETURN_MANAGE_SELECTED: null,
    GET_SEARCH_OPTION: null,
    GET_SEARCH_RESULT: null,
  })
)
