import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'

const reducers = {}
const initState = {
  spuTypes: [
    {
      id: 'all',
      name: i18next.t('全部商品'),
    },
    {
      id: 'set',
      name: i18next.t('已备注商品'),
    },
    {
      id: 'unset',
      name: i18next.t('未备注商品'),
    },
  ],
  customers: {
    list: [],
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
    loading: false,
  },
  detail_customer: {},
  spus: {
    list: [],
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
    loading: false,
  },
}

reducers.spu_remark = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.SPU_REMARK_CUSTOMER_SEARCH_LOADING:
      return Object.assign({}, state, {
        customers: Object.assign({}, state.customers, {
          loading: true,
        }),
      })
    case actionTypes.SPU_REMARK_CUSTOMER_SEARCH_ERROR:
      return Object.assign({}, state, {
        customers: Object.assign({}, state.customers, {
          loading: false,
        }),
      })
    case actionTypes.SPU_REMARK_CUSTOMER_SEARCH_GET:
      return Object.assign({}, state, {
        customers: Object.assign({}, action.data, {
          loading: false,
        }),
      })
    case actionTypes.SPU_REMARK_PRODUCT_SEARCH_LOADING:
      return Object.assign({}, state, {
        spus: Object.assign({}, state.spus, {
          loading: true,
        }),
      })
    case actionTypes.SPU_REMARK_PRODUCT_SEARCH_GET:
      return Object.assign({}, state, {
        spus: Object.assign({}, action.data, {
          loading: false,
        }),
      })
    case actionTypes.SPU_REMARK_SPU_EDITABLE: {
      const list = [...state.spus.list]
      const spu = list[action.index]
      spu.edit = true
      spu.spu_remark_tmp = spu.spu_remark

      return Object.assign({}, state, {
        spus: Object.assign({}, state.spus, {
          list,
        }),
      })
    }
    case actionTypes.SPU_REMARK_SPU_REMARK_CHANGE: {
      const list = [...state.spus.list]
      list[action.index].spu_remark = action.value

      return Object.assign({}, state, {
        spus: Object.assign({}, state.spus, {
          list,
        }),
      })
    }
    case actionTypes.SPU_REMARK_SPU_REMARK_UPDATE: {
      const list = [...state.spus.list]
      const spu = list[action.index]
      spu.edit = false
      spu.update_time = action.data.update_time
      spu.update_user = action.data.update_user

      return Object.assign({}, state, {
        spus: Object.assign({}, state.spus, {
          list,
        }),
      })
    }
    case actionTypes.SPU_REMARK_SPU_REMARK_CANCEL: {
      const list = [...state.spus.list]
      const spu = list[action.index]
      spu.edit = false
      spu.spu_remark = spu.spu_remark_tmp

      return Object.assign({}, state, {
        spus: Object.assign({}, state.spus, {
          list,
        }),
      })
    }

    default:
      return state
  }
}
mapReducers(reducers)
