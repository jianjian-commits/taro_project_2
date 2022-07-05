import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { mapActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../../common/action_storage_key_names'
import _ from 'lodash'
import moment from 'moment'
import { pinyin } from '@gm-common/tool'
import utils from '../util'
import { initOrderType } from '../../../common/enum'

const { getAddress } = utils

const today = moment().startOf('day')

/* -- 初始化筛选参数 -- */
const initFilter = {
  receive_way: '', // 收货方式
  pickUpSelected: null, // 自提点
  date_type: '1', // 1:下单 2:运营 3:收货
  time_config_id: '',
  begin_time: today,
  end_time: today,
  search_text: '',
  salemenu_id: null,
  route_id: null,
  carrier_id_and_driver_id: [],
  area_id: [], // 1,2,3级地理标签
  order_status: 0,
  is_print: '',
  orderType: initOrderType,
  selectedLabel: null,
  searchType: 1,
  sort_type: undefined,
  customized_field: {},
  client: null,
  create_user: null,
}

const reducers = {}
const initState = {
  /* -- 筛选参数 -- */
  ...initFilter,
  selectAllType: 1, // 1 当前页全选, 2 所有页全选
  isSelectAll: false,
  pagination: {
    offset: 0,
    limit: 20,
  },
  // 已勾选的订单
  selectedRecord: [],

  // 订单的数据
  orderList: [],
  // 超出搜索范围,但是根据单号搜到了
  in_query: false,
  // 司机分配表(assigned_delivery)
  distributeOrderList: [],
  isLoading: false,

  // 打印模板数量
  printTemplateCount: 0,
  template_id: 0,

  // 服务时间 (与司机任务共用的数据)
  service_times: [],
  // 报价单
  salemenus: [],
  // 线路列表
  routeList: [
    { value: '', text: i18next.t('全部线路') },
    { value: -1, text: i18next.t('无线路') },
  ],
  // 二级联动的司机列表
  carrierDriverList: [],
  // 系统司机列表  (与司机任务共用的数据)
  driverList: [],
  // 系统承运商列表  (与司机任务共用的数据)
  carrierList: [],
  // 三级联动地理标签
  address: [],
  // 自提点列表
  pickUpList: [],
  // 商户标签列表
  labelList: [],
  // 下单员列表
  createUserList: [],
}

reducers.distributeOrder = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.DISTRIBUTE_ORDER_GET_SALEMENUS: {
      return Object.assign({}, state, {
        salemenus: action.data.map((o) => ({
          value: o.salemenu_id,
          text: o.name,
        })),
      })
    }

    case actionTypes.DISTRIBUTE_ORDER_GET_SERVICE_TIME:
      return Object.assign({}, state, {
        service_times: action.data,
      })

    case actionTypes.DISTRIBUTE_ORDER_GET_ROUTE_LIST: {
      const routeList = _.map(action.routeList, (item) => {
        return {
          value: item.id,
          text: item.name,
        }
      })
      routeList.push({ value: -1, text: i18next.t('无线路') })
      routeList.unshift({ value: '', text: i18next.t('全部线路') })
      return {
        ...state,
        routeList,
      }
    }

    case actionTypes.DISTRIBUTE_ORDER_GET_DRIVER_LIST: {
      const driverList = action.data[0]
      const carriers = action.data[1]
      const carrierDriverList = []

      // 承运商列表
      const carrierList = carriers.slice()
      _.each(carrierList, (v) => {
        v.name = v.company_name
      })
      carrierList.unshift({ id: '0', name: i18next.t('全部承运商') })

      const _driverList = _.map(driverList, (obj) => {
        return {
          value: obj.id,
          name: `${obj.name}${obj.state ? '' : i18next.t('(停用)')}`,
          carrier_id: obj.carrier_id,
          state: obj.state,
        }
      })
      // 司机按承运商分组
      const driverGroup = _.groupBy(_driverList, 'carrier_id')

      _.each(carriers, (obj) => {
        const carrier = {
          name: obj.company_name,
          value: obj.id,
        }
        // 如果存在这个运营商
        if (driverGroup[obj.id]) {
          carrier.children = driverGroup[obj.id]
          carrierDriverList.push(carrier)
        }
      })
      return Object.assign({}, state, {
        carrierDriverList,
        driverList,
        carrierList,
      })
    }

    case actionTypes.DISTRIBUTE_ORDER_GET_ORDER_LIST: {
      const { order, address, distribute_order, in_query } = action.data

      // 已分配司机名单
      let distributeOrderList = []
      for (const [key, val] of Object.entries(distribute_order)) {
        val.driver_id = key
        val.pinyin = pinyin(val.driver_name, 'first_letter')
        distributeOrderList.push(val)
      }

      // 按商家数(降序)、销售金额(降序)、姓名首字母(升序)排序
      distributeOrderList = _.orderBy(
        distributeOrderList,
        ['distribute_count', 'distribute_total_price', 'pinyin'],
        ['desc', 'desc', 'asc'],
      )

      return Object.assign({}, state, {
        isSelectAll: false,
        selectedRecord: [],
        orderList: order,
        address: getAddress(address),
        pagination: action.pagination,
        in_query,
        distributeOrderList,
      })
    }

    case actionTypes.DISTRIBUTE_ORDER_LOADING_SET:
      return Object.assign({}, state, { isLoading: action.isLoading })

    case actionTypes.DISTRIBUTE_ORDER_FILTER_CHANGE:
      return Object.assign({}, state, action.filterObj)

    case actionTypes.DISTRIBUTE_ORDER_DATE_PICKED:
      return Object.assign({}, state, {
        begin_time: action.begin_time,
        end_time: action.end_time,
      })

    case actionTypes.DISTRIBUTE_ORDER_SELECT_DATE_TYPE:
      return Object.assign({}, state, {
        date_type: action.dateType,
        begin_time: today,
        end_time: today,
      })
    case actionTypes.DISTRIBUTE_ORDER_SELECT_ROUTE:
      return {
        ...state,
        route_id: action.route_id,
      }

    case actionTypes.DISTRIBUTE_ORDER_SELECT_CARRIER_AND_DRIVER:
      return Object.assign({}, state, {
        carrier_id_and_driver_id: action.carrier_id_and_driver_id,
      })

    case actionTypes.DISTRIBUTE_ORDER_SELECT_AREA:
      return Object.assign({}, state, { area_id: action.area_id })

    case actionTypes.DISTRIBUTE_ORDER_GET_PRINT_TEMPLATE:
      return Object.assign({}, state, {
        printTemplateCount: action.data,
      })

    case actionTypes.DISTRIBUTE_ORDER_SELECT_PRINT_TEMPLATE:
      return Object.assign({}, state, { template_id: action.value })

    case actionTypes.DISTRIBUTE_ORDER_CHANGE_SELECT_ALL_TYPE:
      return {
        ...state,
        selectAllType: action.selectAllType,
      }

    case actionTypes.DISTRIBUTE_ORDER_RESET_FILTER:
      return {
        ...state,
        ...initFilter,
      }

    case actionTypes.DISTRIBUTE_ORDER_GET_LABELS:
      return {
        ...state,
        labelList: action.labelList,
      }

    case actionTypes.DISTRIBUTE_ORDER_GET_CREATE_USER:
      return {
        ...state,
        createUserList: action.createUserList,
      }

    case actionTypes.DISTRIBUTE_ORDER_CHANGE_LABEL:
      return {
        ...state,
        selectedLabel: action.selectedLabel,
      }

    case actionTypes.DISTRIBUTE_ORDER_CHANGE_SEARCH_TYPE:
      return {
        ...state,
        searchType: action.searchType,
      }

    case actionTypes.DISTRIBUTE_ORDER_CHANGE_SORT_TYPE: {
      const { field } = action
      const sortType = state.sort_type

      let sortTypeName = ''

      if (sortType) {
        const isDesc = sortType.indexOf('_desc') > -1
        const isCurrentName = sortType.indexOf(field) > -1

        if (isCurrentName) {
          sortTypeName = isDesc ? field + '_asc' : ''
        } else {
          sortTypeName = field + '_desc'
        }
      } else {
        sortTypeName = field + '_desc'
      }
      return {
        ...state,
        sort_type: sortTypeName,
      }
    }

    default:
      return state
  }
}
const storageOptions = {}
storageOptions.distributeOrder = {
  selector: ['date_type'],
  name: ACTION_STORAGE_KEY_NAMES.DISTRIBUTE_ORDER,
}

mapActionStorage(reducers, storageOptions)
mapReducers(reducers)
