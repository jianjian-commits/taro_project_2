import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'
import moment from 'moment'

const reducers = {}

const initState = {
  driverList: [],
  cabModelList: [],
  carrierList: [],
  headerFilter: {
    driverSearchText: null,
    carrierSearchText: null,
    carModelSearchText: null,
  },
  pagination: {
    count: 0,
    limit: 10,
    offset: 0,
  },
}

reducers.carManage = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.CAR_MANAGE_GET_CAB_MODEL_LIST:
      return Object.assign({}, state, { cabModelList: action.cabModelList })
    case actionTypes.CAR_MANAGE_GET_CARRIER_LIST:
      return Object.assign({}, state, { carrierList: action.carrierList })
    case actionTypes.CAR_MANAGE_ADD_CAB_MODEL:
      return Object.assign({}, state)
    case actionTypes.CAR_MANAGE_ADD_CARRIER:
      return Object.assign({}, state)
    case actionTypes.CAR_MANAGE_CHECK_PHONE_NAME:
      return Object.assign({}, state)
    case actionTypes.CAR_MANAGE_GET_DRIVER_LIST: {
      const driverList = action.driverList.slice()
      _.each(driverList, (driver) => {
        driver.editing = false
      })
      let pagination
      if (action.pagination.limit) {
        pagination = action.pagination
      } else {
        pagination = {
          count: 0,
          limit: 10,
          offset: 0,
        }
      }
      return Object.assign({}, state, { driverList, pagination })
    }
    case actionTypes.CAR_MANAGE_ADD_DRIVER:
      return Object.assign({}, state)
    case actionTypes.CAR_MANAGE_RESET_PASSWD:
      return Object.assign({}, state)
    case actionTypes.CAR_MANAGE_UPDATE_DRIVER_PROFILE: {
      const updateDriver = Object.assign({}, action.driverInfo)
      const driverList = Object.assign({}, state.driverList)
      const targetDriver = _.find(
        driverList,
        (driver) => driver.id === updateDriver.id
      )
      Object.assign(targetDriver, updateDriver)

      return Object.assign({}, state, driverList)
    }
    case actionTypes.CAR_MANAGE_SET_DRIVER_SEARCH_TEXT: {
      return {
        ...state,
        headerFilter: {
          ...state.headerFilter,
          driverSearchText: action.q,
        },
      }
    }
    case actionTypes.CAR_MANAGE_SET_CARRIER_SEARCH_TEXT: {
      return {
        ...state,
        headerFilter: {
          ...state.headerFilter,
          carrierSearchText: action.q,
        },
      }
    }
    case actionTypes.CAR_MANAGE_SET_CAR_MODEL_SEARCH_TEXT: {
      return {
        ...state,
        headerFilter: {
          ...state.headerFilter,
          carModelSearchText: action.q,
        },
      }
    }
    default:
      return state
  }
}

const exportKeys = [
  { id: 'create_time', name: i18next.t('创建时间') },
  { id: 'route_name', name: i18next.t('线路名称') },
  { id: 'sid', name: i18next.t('商户ID') },
  { id: 'resname', name: i18next.t('商户名称') },
  { id: 'area', name: i18next.t('地理标签') },
  { id: 'addr_detail', name: i18next.t('配送地址') },
  { id: 'name', name: i18next.t('联系人') },
  { id: 'telephone', name: i18next.t('联系电话') },
  { id: 'create_user', name: i18next.t('创建人') },
]

const routeManageState = {
  routeList: [],
  pagination: {},
  exportData: [],
  exportKeys,
  routesDetail: [],
  headerFilter: {
    searchText: '',
  },
}

reducers.routeManage = (state = routeManageState, action) => {
  switch (action.type) {
    case actionTypes.ROUTE_MANAGE_GET_ROUTE_LIST: {
      const list = _.map(action.routeList, (item) => {
        const create_time = moment(item.create_time).format(
          'YYYY-MM-DD HH:mm:ss'
        )
        return {
          ...item,
          create_time: create_time,
        }
      })
      return {
        ...state,
        routeList: list,
      }
    }
    case actionTypes.ROUTE_MANAGE_CHANGE_PAGINATION:
      return {
        ...state,
        pagination: action.data,
      }
    case actionTypes.ROUTE_MANAGE_HEADER_FILTER_CHANGE:
      return {
        ...state,
        headerFilter: {
          ...state.headerFilter,
          ...action.data,
        },
      }
    case actionTypes.ROUTE_MANAGE_GET_ROUTE_DETAIL:
      return {
        ...state,
        routesDetail: action.routesDetail,
      }
    case actionTypes.ROUTE_MANAGE_GET_EXPORT_DATA:
      return {
        ...state,
        exportData: action.exportData,
      }
    default:
      return state
  }
}

mapReducers(reducers)
