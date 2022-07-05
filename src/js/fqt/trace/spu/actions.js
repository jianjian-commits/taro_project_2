import { i18next } from 'gm-i18n'
import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { Request } from '@gm-common/request'

let actions = {}
actions.searchFqtSpu = function (searchData) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.FQT_SPU_GET,
    })
    Request('/station/fqt/other_query')
      .data(searchData)
      .get()
      .then(function (result) {
        dispatch({
          type: actionTypes.FQT_SPU_RECEIVE,
          data: {
            list: result.data.fqt_records,
            count: result.data.cnt,
            offset: searchData.offset,
            limit: searchData.limit,
          },
        })
      })
  }
}

actions.uploadReport = function (file) {
  return (dispatch) => {
    Request('/station/fqt/upload')
      .data(file)
      .post()
      .then(function () {
        dispatch({
          type: actionTypes.FQT_UPLOAD_SUCC,
        })
      })
  }
}

actions.uploadModalShow = function () {
  return {
    type: actionTypes.FQT_UPLOAD_SHOW,
  }
}

actions.uploadModalHide = function () {
  return {
    type: actionTypes.FQT_UPLOAD_SUCC,
  }
}

actions.deleteSpuFqt = function (data) {
  if (!window.confirm(i18next.t('确定删除？'))) return

  return (dispatch) => {
    Request('/station/fqt/other_query')
      .data(data)
      .post()
      .then(function (result) {
        if (result.code === 0) {
          dispatch({
            type: actionTypes.FQT_SPU_DEL_SUCC,
            spu_id: data.spu_id,
          })
        }
      })
  }
}

mapActions(actions)
