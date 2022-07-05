import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { Request } from '@gm-common/request'

const actions = {}

actions.spu_remark_customer_search = (keyword, page) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SPU_REMARK_CUSTOMER_SEARCH_LOADING,
    })

    let searchData = { keyword }
    if (page) {
      searchData = Object.assign(searchData, page)
    } else {
      searchData = Object.assign(searchData, {
        offset: 0,
        limit: 10,
      })
    }

    Request('/station/spu_remark/customer_search/')
      .data(searchData)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SPU_REMARK_CUSTOMER_SEARCH_GET,
          data: json.data,
        })
      })
      .catch(() => {
        dispatch({
          type: actionTypes.SPU_REMARK_CUSTOMER_SEARCH_ERROR,
        })
      })
  }
}

actions.spu_remark_spu_search = (
  address_id,
  spu_type,
  spu_search_text,
  page
) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SPU_REMARK_PRODUCT_SEARCH_LOADING,
    })

    let searchData = { address_id, spu_type, spu_search_text }
    if (page) {
      searchData = Object.assign(searchData, page)
    } else {
      searchData = Object.assign(searchData, {
        offset: 0,
        limit: 10,
      })
    }

    Request('/station/spu_remark/spu_search/')
      .data(searchData)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SPU_REMARK_PRODUCT_SEARCH_GET,
          data: json.data,
        })
      })
  }
}

actions.spu_remark_spu_editable = (index) => {
  return {
    type: actionTypes.SPU_REMARK_SPU_EDITABLE,
    index,
  }
}

actions.spu_remark_spu_remark_change = (index, value) => {
  return {
    type: actionTypes.SPU_REMARK_SPU_REMARK_CHANGE,
    index,
    value,
  }
}

actions.spu_remark_spu_remark_update = (index, address_id) => {
  return (dispatch, getState) => {
    const { spus } = getState().spu_remark
    const spu = spus.list[index]

    // 如果备注没有改动,则同点击取消
    if (spu.spu_remark_tmp === spu.spu_remark) {
      return dispatch({
        type: actionTypes.SPU_REMARK_SPU_REMARK_CANCEL,
        index,
      })
    }

    return Request('/station/spu_remark/update_remark/')
      .data({
        address_id,
        spu_id: spu.spu_id,
        remark: spu.spu_remark,
      })
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.SPU_REMARK_SPU_REMARK_UPDATE,
          index,
          data: json.data,
        })
        return json
      })
  }
}

actions.spu_remark_spu_remark_cancel = (index) => {
  return {
    type: actionTypes.SPU_REMARK_SPU_REMARK_CANCEL,
    index,
  }
}

mapActions(actions)
