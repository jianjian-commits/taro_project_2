import { bindAsyncActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import store from './frame/store'
import globalStore from './stores/global'
import { getStaticStorage } from 'gm_static_storage'

let actions = {}

actions.global_get_unit_name = () => {
  return (dispatch) => {
    const unitName = globalStore.isMalaysia()
      ? 'en.unit_name.json'
      : 'unit_name.json'
    return getStaticStorage(`/common/${unitName}`).then((json) => {
      dispatch({
        type: actionTypes.GLOBAL_GET_UNIT_NAME,
        data: json.unitName || [],
      })
      return json
    })
  }
}

actions = bindAsyncActions(actions, store.dispatch)

export default actions
