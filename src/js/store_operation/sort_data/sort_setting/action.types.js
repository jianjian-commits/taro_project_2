import actionTypes from '../../../action.types'
import { keyMirror } from '@gm-common/tool'

export default Object.assign(
  actionTypes,
  keyMirror({
    SORT_SETTING_SELECT_SPU_LIB: null,
    SORT_SETTING_CHANGE_LOADING: null,
    SORT_SETTING_CHANGE_EDITING: null,
    SORT_SETTING_CHANGE_SORT_TYPE: null,
    SORT_SETTING_GET_SPU: null,
    SORT_SETTING_CHANGE_SEARCH: null,
    SORT_SETTING_EMPTY_LIST: null,
  }),
)
