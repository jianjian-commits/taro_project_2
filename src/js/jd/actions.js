import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types.js'
import { Request } from '@gm-common/request'

let actions = {}

actions.jd_get_orders = () => {
  return (dispatch) => {
    return Request('/station/merchant/salemenu/skus')
      .get()
      .then((json) => {
        let data = json.data
        dispatch({
          type: actionTypes.JD_GET_ORDERS,
          upList: data.on_shelf ? data.on_shelf : {},
          downList: data.off_shelf ? data.off_shelf : {},
        })
      })
  }
}

actions.jd_update_preCode = (preCode, id, index, state) => {
  if (preCode === '') {
    const query = {
      sku_id: id,
      attr: 'merchant_sku_id',
    }
    return (dispatch) => {
      return Request('/station/merchant/salemenu/sku/clear')
        .data(query)
        .post()
        .then(() => {
          dispatch({
            type: actionTypes.JD_UPDATE_PRE_CODE,
            preCode: preCode,
            index: index, // 所在数组的元素索引
            state: state,
          })
        })
    }
  } else {
    const query = {
      sku_id: id,
      merchant_sku_id: preCode,
    }
    return (dispatch) => {
      return Request('/station/merchant/salemenu/sku/update')
        .data(query)
        .post()
        .then(() => {
          dispatch({
            type: actionTypes.JD_UPDATE_PRE_CODE,
            preCode: preCode,
            index: index, // 所在数组的元素索引
            state: state,
          })
        })
    }
  }
}

actions.jd_update_valid_day = (validDay, id, index, state) => {
  if (validDay === '') {
    const query = {
      sku_id: id,
      attr: 'fresh_days',
    }
    return (dispatch) => {
      return Request('/station/merchant/salemenu/sku/clear')
        .data(query)
        .post()
        .then(() => {
          dispatch({
            type: actionTypes.JD_UPDATE_VALID_DAY,
            validDay: validDay,
            index: index, // 所在数组的元素索引
            state: state,
          })
        })
    }
  } else {
    const query = {
      sku_id: id,
      fresh_days: validDay,
    }
    return (dispatch) => {
      return Request('/station/merchant/salemenu/sku/update')
        .data(query)
        .post()
        .then(() => {
          dispatch({
            type: actionTypes.JD_UPDATE_VALID_DAY,
            validDay: validDay,
            index: index, // 所在数组的元素索引
            state: state,
          })
        })
    }
  }
}

mapActions(actions)
