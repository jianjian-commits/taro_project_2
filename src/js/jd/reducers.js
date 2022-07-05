import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'

let reducers = {}

reducers.jd = (state, action) => {
  switch (action.type) {
    case actionTypes.JD_GET_ORDERS:
      return Object.assign({}, state, {
        upList: action.upList,
        downList: action.downList,
      })
    case actionTypes.JD_UPDATE_PRE_CODE: {
      const { index, preCode } = action
      const type = action.state
      let newList = type ? state.upList : state.downList
      newList[index].merchant_sku_id = preCode
      if (type) {
        return Object.assign({}, state, { upList: newList })
      } else {
        return Object.assign({}, state, { downList: newList })
      }
    }
    case actionTypes.JD_UPDATE_VALID_DAY: {
      const { index, validDay } = action
      const type = action.state
      let newList = type ? state.upList : state.downList
      newList[index].fresh_days = validDay
      if (type) {
        return Object.assign({}, state, { upList: newList })
      } else {
        return Object.assign({}, state, { downList: newList })
      }
    }
    default:
      return state
  }
}

mapReducers(reducers)
