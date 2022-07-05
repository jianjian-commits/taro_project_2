import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'

const initState = {
  search_option: {
    refund_solution: { 160: i18next.t('二次入库'), 157: i18next.t('放弃取货') },
    refund_state: {},
    station: [],
    store_station: [],
    driver: [],
  },
  search_result: {
    total_num: 0,
    refund_list: [],
  },
  sourceReturnList: [],
}

let reducers = {}
reducers.buy_sell_return_manage = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.GET_SEARCH_OPTION:
      return Object.assign({}, state, {
        search_option: Object.assign({}, state.search_option, {
          refund_state: action.data.refund_state,
          station: action.data.station,
          store_station: action.data.store_station,
          driver: action.data.driver,
        }),
      })

    case actionTypes.GET_SEARCH_RESULT:
      return Object.assign({}, state, {
        search_result: action.data,
        sourceReturnList: action.data.refund_list,
      })

    case actionTypes.RETURN_MANAGE_SELECTED: {
      return Object.assign({}, state, {
        search_result: Object.assign({}, state.search_result, {
          refund_list: action.list,
        }),
      })
    }

    default:
      return state
  }
}

mapReducers(reducers)
