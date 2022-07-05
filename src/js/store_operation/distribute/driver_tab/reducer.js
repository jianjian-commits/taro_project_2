import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import moment from 'moment'
import { mapActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../../common/action_storage_key_names'
import { initOrderType } from '../../../common/enum'

const today = moment().startOf('day')

const reducers = {}
const initState = {
  // 筛选参数
  date_type: '1', // 1:下单 2:运营 3:收货
  time_config_id: '',
  begin_time: today,
  end_time: today,
  selected_carrier: null,
  pagination: {
    offset: 0,
    limit: 20,
  },
  // 司机任务列表
  driverTaskList: [],
  isLoading: false,
  orderType: initOrderType, // 订单类型

  printTemplateCount: 0,
  template_id: 0,

  // 司机订单模态框
  driverOrder: {
    pagination: {
      offset: 0,
      limit: 9,
    },
    driverOrderList: [],
    // 司机任务列表中订单列表
    paginationTask: [],
    driverOrderListTask: [],
    selectedDriverOrderTaskList: [],
    isSelectAllPage: false,
  },
  // 司机任务订单商品明细
  driverOrderProduct: {
    data: [],
    pagination: {
      count: 0,
      offset: 0,
      limit: 10,
    },
  },

  service_times: [],
}

reducers.distributeDriver = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.DISTRIBUTE_DRIVER_INITIAL_SERVICE_TIMES:
      return Object.assign({}, state, {
        service_times: action.service_times,
      })

    case actionTypes.DISTRIBUTE_DRIVER_GET_DRIVER_TASK_LIST: {
      return Object.assign({}, state, {
        driverTaskList: action.data,
        pagination: action.pagination,
      })
    }

    case actionTypes.DISTRIBUTE_DRIVER_SELECT_DATE_TYPE:
      return Object.assign({}, state, {
        date_type: action.dateType,
        begin_time: today,
        end_time: today,
      })

    case actionTypes.DISTRIBUTE_DRIVER_FILTER_CHANGE:
      return Object.assign({}, state, action.filterObj)

    case actionTypes.DISTRIBUTE_DRIVER_DATE_PICKED:
      return Object.assign({}, state, {
        begin_time: action.begin_time,
        end_time: action.end_time,
      })

    case actionTypes.DISTRIBUTE_DRIVER_SELECTED_CARRIER:
      return Object.assign({}, state, {
        selected_carrier: action.selected_carrier,
      })

    case actionTypes.DISTRIBUTE_DRIVER_GET_DRIVER_ORDER_LIST: {
      const { order } = action.data
      return Object.assign({}, state, {
        driverOrder: {
          ...state.driverOrder,
          driverOrderList: order,
          pagination: action.pagination,
        },
      })
    }

    case actionTypes.DISTRIBUTE_DRIVER_GET_DRIVER_ORDER_LIST_TASK: {
      const { order } = action.data
      const driverOrderListTask = state.driverOrder.driverOrderListTask
      driverOrderListTask[action.index] = order
      const paginationTask = state.driverOrder.paginationTask
      paginationTask[action.index] = action.pagination

      return Object.assign({}, state, {
        driverOrder: {
          ...state.driverOrder,
          driverOrderListTask,
          paginationTask,
        },
      })
    }

    case actionTypes.DISTRIBUTE_DRIVER_CLEAN_DRIVER_ORDER_LIST:
      return Object.assign({}, state, {
        driverOrder: {
          ...state.driverOrder,
          driverOrderList: [],
          pagination: {
            offset: 0,
            limit: 9,
          },
        },
      })

    case actionTypes.DISTRIBUTE_DRIVER_GET_PRINT_TEMPLATE:
      return Object.assign({}, state, {
        printTemplateCount: action.data,
      })

    case actionTypes.DISTRIBUTE_DRIVER_SELECT_PRINT_TEMPLATE:
      return Object.assign({}, state, { template_id: action.value })

    case actionTypes.DRIVER_TASK_GET_PRODUCT_DATA:
      return Object.assign({}, state, {
        driverOrderProduct: {
          data: action.data,
          pagination: {
            count: action.data.length,
            offset: 0,
            limit: 10,
          },
        },
      })

    case actionTypes.DRIVER_TASK_SET_PRODUCT_PAGINATION:
      return Object.assign({}, state, {
        driverOrderProduct: {
          ...state.driverOrderProduct,
          pagination: {
            ...state.driverOrderProduct.pagination,
            ...action.data,
          },
        },
      })

    case actionTypes.DRIVER_ORDER_LIST_TASK:
      return Object.assign({}, state, {
        driverOrder: {
          ...state.driverOrder,
        },
      })

    case actionTypes.DRIVER_ORDER_TASK_LIST_SELECTED:
      return Object.assign({}, state, {
        driverOrder: {
          ...state.driverOrder,
          selectedDriverOrderTaskList: action.selectedDriverOrderTaskList,
        },
      })

    case actionTypes.DRIVER_ORDER_TASK_LIST_LOADING:
      return Object.assign({}, state, {
        isLoading: action.isLoading,
      })

    case actionTypes.DRIVER_ORDER_TASK_LIST_SELECT_ALL_PAGE:
      return Object.assign({}, state, {
        driverOrder: {
          ...state.driverOrder,
          isSelectAllPage: action.isSelectAllPage,
        },
      })

    default:
      return state
  }
}
const storageOptions = {}
storageOptions.distributeDriver = {
  selector: ['date_type'],
  name: ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_DRIVER,
}

mapActionStorage(reducers, storageOptions)
mapReducers(reducers)
