import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { buildSortingList } from '../common/util'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import moment from 'moment'
const date = moment().startOf('day')

const reducers = {}
const initState = {
  loading: true,
  sortingList: [],
  cycle: [],
  cycleSelected: 1,
  containOuter: true,
  dataByCategory: [],
  // 运营周期
  serviceTime: [],
  // 分拣进度
  schedule: {
    filter: {
      targetDate: date,
      time_config_id: '',
    },
    total_schedule: {},
    category_schedule: [],
    sort_data: {},
  },
  // 分拣明细
  detail: {
    filter: {
      time_config_id: '',
      begin: date,
      end: date,
      searchText: null,
      categorySelected: {
        category1_ids: [],
        category2_ids: [],
        pinlei_ids: [],
      },
      batchRemark: '',
      isWeigh: '',
      weighed: '',
      printed: '',
      salemenuSelectd: null,
      routeId: 0,
      status: 0,
      inspect_status: '',
      isAllSelected: false,
      selectedList: [],
    },
    salemenuList: [],
    categoryList: [],
    batchRemarkList: [],
    routeList: [],
    tableList: [],
    filterData: {},
  },
}

reducers.sorting = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.SORTING_CHANGE_LOADING:
      return Object.assign({}, state, { loading: action.loading })
    case actionTypes.SORTING_GET_TASK_CYCLE:
      return Object.assign({}, state, { cycle: action.cycle })
    case actionTypes.SORTING_CHANGE_CYCLE_SELECTED:
      return Object.assign({}, state, { cycleSelected: action.itemId })
    case actionTypes.SORTING_CHANGE_CONTAINER_OUTER:
      return Object.assign({}, state, { containOuter: action.checked })
    case actionTypes.SORTING_GET_SORTING_LIST:
      return Object.assign({}, state, {
        sortingList: action.sortingList,
        dataByCategory: buildSortingList(action.sortingList),
      })
    // 获取运营周期
    case actionTypes.SORTING_GET_SERVICE_TIME: {
      const serviceTime = action.serviceTime
      const time_config_id = (serviceTime[0] && serviceTime[0]._id) || ''
      return Object.assign({}, state, {
        serviceTime,
        schedule: {
          ...state.schedule,
          ...{
            filter: { ...state.schedule.filter, time_config_id },
          },
        },
        detail: {
          ...state.detail,
          ...{
            filter: { ...state.detail.filter, time_config_id },
          },
        },
      })
    }
    // 获取分拣进度搜索数据
    case actionTypes.SORTING_GET_SCHEDULE_SEARCH_DATA: {
      return Object.assign({}, state, {
        schedule: { ...state.schedule, ...action.schedule },
      })
    }
    // 共用筛选器
    case actionTypes.SORTING_SELECT_FILTER_CHANGE: {
      const tab = action.tab
      const filter = { ...state[tab].filter, ...action.filter }
      return Object.assign({}, state, {
        [tab]: Object.assign({}, state[tab], { filter }),
      })
    }

    // 分拣明细 商品筛选
    case actionTypes.SORTING_MERCHANDISE_FILTER_GET_ALL: {
      return Object.assign({}, state, {
        detail: { ...state.detail, ...{ categoryList: action.data } },
      })
    }
    // 获取报价单
    case actionTypes.SORTING_DETAIL_GET_SALE_LIST: {
      const list = action.data || []
      list.unshift({ value: '', name: '全部报价单' })
      return Object.assign({}, state, {
        detail: { ...state.detail, ...{ salemenuList: list } },
      })
    }
    // 获取线路
    case actionTypes.SORTING_DETAIL_GET_ROUTE_LIST: {
      const routeList = _.map(action.data, (item) => {
        return {
          value: item.id,
          name: item.name,
        }
      })
      routeList.unshift({ value: -1, name: i18next.t('无线路') })
      routeList.unshift({ value: 0, name: i18next.t('全部线路') })
      return Object.assign({}, state, {
        detail: { ...state.detail, ...{ routeList } },
      })
    }
    // 任务筛选
    case actionTypes.SORTING_BATCH_LIST_GET_ALL: {
      return Object.assign({}, state, {
        detail: { ...state.detail, ...{ batchRemarkList: action.data } },
      })
    }
    // 表格数据
    case actionTypes.SORTING_GET_DETAIL_SEARCH_DATA: {
      return Object.assign({}, state, {
        detail: Object.assign({}, state.detail, {
          tableList: [...action.data],
        }),
      })
    }
    // 获取筛选数据
    case actionTypes.GET_FILTER_DATA: {
      return Object.assign({}, state, {
        detail: { ...state.detail, ...{ filterData: action.data } },
      })
    }
    // 选择
    case actionTypes.SORTING_VIEW_SKU_LIST_SKU_SELECT: {
      let selectedList = []
      const list = [...state.detail.tableList]
      const checkFilter = (item) =>
        action.isOldOrderEditable
          ? true
          : item.status <= 5 && item.status !== -1
      const data = action.data
      // 传入数组为单选
      if (Array.isArray(data)) {
        selectedList = _.filter(data, (id) => {
          const item = _.find(list, (v) => v.id === id)
          return checkFilter(item)
        })
      } else {
        selectedList = data
          ? _.map(list, (item) => {
              if (checkFilter(item)) return item.id
            })
          : []
      }

      return Object.assign({}, state, {
        detail: Object.assign({}, state.detail, {
          filter: { ...state.detail.filter, selectedList },
        }),
      })
    }

    case actionTypes.SORTING_ACTIVE_THE_BATCH:
    default:
      return state
  }
}

mapReducers(reducers)
