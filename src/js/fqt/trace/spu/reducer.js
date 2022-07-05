import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'

const initState = {
  spu: {
    loading: false,
    list: [],
    pagination: {
      count: 0,
      offset: 0,
      limit: 20,
    },
  },
  upload_modal_show: false,
}

let reducers = {}
reducers.fqt = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.FQT_SPU_RECEIVE:
      return Object.assign({}, state, {
        spu: {
          loading: false,
          list: action.data.list,
          pagination: {
            count: action.data.count,
            offset: action.data.offset || 0,
            limit: action.data.limit || 20,
          },
        },
      })

    case actionTypes.FQT_SPU_GET:
      return Object.assign({}, state, {
        spu: Object.assign({}, state.spu, {
          loading: true,
        }),
      })

    case actionTypes.FQT_SPU_DEL_SUCC: {
      let list = _.reject(state.spu.list, function (item) {
        return item.spu_id === action.spu_id
      })

      return Object.assign({}, state, {
        spu: Object.assign({}, state.spu, {
          list: list,
          pagination: {
            count: list.length,
            offset: state.offset || 0,
            limit: state.limit || 20,
          },
        }),
      })
    }
    case actionTypes.FQT_UPLOAD_SUCC:
      return Object.assign({}, state, {
        upload_modal_show: false,
      })

    case actionTypes.FQT_UPLOAD_SHOW:
      return Object.assign({}, state, {
        upload_modal_show: true,
      })

    default:
      return state
  }
}

mapReducers(reducers)
