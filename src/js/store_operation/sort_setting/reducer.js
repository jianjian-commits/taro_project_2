import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'

const initState = {
  loading: true,
  spuLibSelected: 1,
  spuList: [],
  search: '',
  pagination: {
    offset: 1,
    limit: 20,
    count: 0,
  },
}

const reducers = {}
reducers.sortSetting = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.SORT_SETTING_GET_SPU: {
      const spuList = action.spuList
      _.each(spuList, (spu) => {
        spu.editing = false
      })
      const pagination = _.keys(action.pagination).length
        ? action.pagination
        : {
            offset: 0,
            limit: 20,
            count: 0,
          }
      return Object.assign({}, state, { spuList, pagination, loading: false })
    }

    case actionTypes.SORT_SETTING_SELECT_SPU_LIB:
      return Object.assign({}, state, { spuLibSelected: action.spuLib })

    case actionTypes.SORT_SETTING_CHANGE_LOADING:
      return Object.assign({}, state, { loading: action.loading })

    case actionTypes.SORT_SETTING_CHANGE_EDITING: {
      const spuList = state.spuList.slice()
      const { spuId, key, value } = action.payload
      const targetSpu = _.find(spuList, (spu) => spu.spu_id === spuId)
      targetSpu[key] = value
      return Object.assign({}, state, { spuList })
    }

    case actionTypes.SORT_SETTING_CHANGE_SORT_TYPE: {
      const spuList = state.spuList.slice()
      const targetSpu = _.find(spuList, (spu) => spu.spu_id === action.spuId)
      targetSpu.dispatch_method = action.sortType
      return Object.assign({}, state, { spuList })
    }

    case actionTypes.SORT_SETTING_CHANGE_SEARCH:
      return Object.assign({}, state, { search: action.search })

    case actionTypes.SORT_SETTING_EMPTY_LIST:
      return Object.assign({}, state, {
        spuList: [],
        loading: true,
        pagination: {
          offset: 1,
          limit: 20,
          count: 0,
        },
      })

    default:
      return state
  }
}

mapReducers(reducers)
