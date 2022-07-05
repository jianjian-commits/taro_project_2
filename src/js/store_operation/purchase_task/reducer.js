import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action_types'
import _ from 'lodash'
import moment from 'moment'
import { purchaseTaskSearchDateTypes } from '../../common/enum'
import { mapActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'

const resetSelected = (list) => {
  _.forEach(list, (item) => {
    item._gm_select = false
    _.forEach(item.tasks, (t) => {
      t._gm_select = false
    })
  })
}

const reducers = {}

const date = moment().startOf('day')
const endDate = moment().endOf('day')

const initState = {
  // 采购任务
  serviceTimes: [],

  headerFilter: {
    search_text: '',
    route_id: null,
    route_ids: [],
    time_config_id: null,
    cycle_start_time: moment(),
    categoryFilter: {
      category1_ids: [],
      category2_ids: [],
      pinlei_ids: [],
    },
    taskStatus: '',
    orderStatus: null,
    supplier: [],
    purchaser: null,
    dateType: purchaseTaskSearchDateTypes.ORDER.type,
    begin: date,
    end: endDate,
    operateStatus: '', // 按下单日期和按收获日期中的选择运营时间
    purchaser_id: null,
    sortStatus: '', // 分拣状态
    siteTask: '', // 站点任务
    has_created_sheet: '', // 是否生成采购单
    source_type: 0,
    addressLabel: null, // 商户标签 {value: '', text: ''}
    addresses: [], // 商户
    changeOption: '0', // 差异状态
    client: '', // 订单来源
  },

  siteList: [],

  categories: [],
  suppliers: [], // { value: '', text: '' }
  canUpdateSupliers: [],
  purchases: [],
  routeList: [
    // { name: i18next.t('全部线路') },
    { value: -1, name: i18next.t('无线路') },
  ],

  taskSupplierMap: {},

  taskListLoading: false,
  taskList: [], // 表格使用的list
  taskListSelected: [],
  taskListPagination: {
    // 这里保存的是下一页的分页状态
    limit: 10,
    offset: 0,
    page_obj: null,
    count: 0,
  },

  // 精确搜索后一条数据 结构还是数组，但是里面只有对应的一个数据
  taskListItem: [],

  // 当前的分页对象page_obj与reverse（确定上下页关系） 保存当前的分页的状态
  currentPage: {
    page_obj: null,
    reverse: null,
  },

  // 打印数据
  printList: [],

  // 供应商和采购员 sidebar 数据
  supplierPurchaserFilter: [],

  // sideBar中 选中的id
  supplierPurchaserId: null,

  // 采购条目
  purchaseItem: {
    items: [],
    settle_supplier_avail: [],
  },

  // 采购市场分析
  purchaseMarketInfo: {},

  // 采购记录
  purchaseHistory: [],

  // 采购员管理
  purchaseSourcer: [],

  // 商户标签
  addressLabelList: [],

  // 商户列表
  merchandiseList: [],

  optional_purchasers: [],

  reference_price_type: 1,

  purchaseBatchModify: {
    selectedSupplier: null,
    selectedPurchaser: null,
    selectAllPage: 0, // 0. 勾选当前页，1. 勾选全部页
  },
}

reducers.purchase_task = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.PURCHASE_TASK_GET_SERVICE_TIME:
      return Object.assign({}, state, { serviceTimes: action.serviceTimes })

    case actionTypes.PURCHASE_LIST_GET_ALL_SUPPLIER_PURCHASER:
      return Object.assign({}, state, { supplierPurchaserFilter: action.data })

    case actionTypes.PURCHASE_TASK_GET_FILTER_INIT_DATA:
      return Object.assign({}, state, action.data)

    case actionTypes.PURCHASE_TASK_HEADER_FILTER_CLEAR: {
      const { dateType, time_config_id, begin, end } = state.headerFilter
      return Object.assign({}, state, {
        headerFilter: {
          search_text: '',
          route_id: null,
          route_ids: [],
          time_config_id,
          cycle_start_time: moment(),
          categoryFilter: {
            category1_ids: [],
            category2_ids: [],
            pinlei_ids: [],
          },
          taskStatus: '',
          orderStatus: null,
          supplier: [],
          dateType,
          begin,
          end,
          purchaser_id: null,
          sortStatus: '', // 分拣状态
          siteTask: '', // 站点任务
          has_created_sheet: '', // 是否生成采购单
          source_type: 0,
          addressLabel: null,
          addresses: [],
          changeOption: '0',
          client: '',
        },
      })
    }

    case actionTypes.PURCHASE_TASK_HEADER_FILTER_CHANGE: {
      const filter = action.data
      if (
        filter.dateType ||
        (filter.time_config_id &&
          filter.time_config_id !== state.headerFilter.time_config_id)
      ) {
        filter.begin = date
        filter.end = endDate
      }
      return Object.assign({}, state, {
        headerFilter: Object.assign(state.headerFilter, filter),
      })
    }

    case actionTypes.PURCHASE_TASK_BATCH_MODIFY_CHANGE:
      return {
        ...state,
        purchaseBatchModify: {
          ...state.purchaseBatchModify,
          ...action.data,
        },
      }

    case actionTypes.PURCHASE_TASK_LIST_SEARCH: {
      return Object.assign({}, state, {
        taskList: action.data,
        taskListPagination: {
          ...state.taskListPagination,
          ...action.pagination,
        },
        taskListLoading: false,
        currentPage: action.currentPage,
      })
    }

    case actionTypes.PURCHASE_TASK_LIST_PAGINATION: {
      return Object.assign({}, state, {
        taskListPagination: {
          offset: action.offset,
          limit: action.limit,
        },
      })
    }

    case actionTypes.PURCHASE_TASK_PAGINATION_RESET:
      return Object.assign({}, state, {
        taskListPagination: {
          ...state.taskListPagination,
          ...{
            limit: 10,
            page_obj: null,
          },
        },
      })

    case actionTypes.PURCHASE_TASK_LIST_SEARCH_LOADING:
      return Object.assign({}, state, {
        taskList: [],
        taskListLoading: true,
      })

    case actionTypes.PURCHASE_TASK_LIST_SEARCH_ERROR:
      return Object.assign({}, state, {
        taskList: [],
        taskListLoading: false,
      })

    case actionTypes.PURCHASE_TASK_LIST_SEARCH_ITEM:
      return Object.assign({}, state, {
        taskListItem: action.data,
      })

    case actionTypes.PURCHASE_TASK_LIST_SEARCH_ITEM_CLEAR:
      return Object.assign({}, state, {
        taskListItem: [],
      })

    case actionTypes.PURCHASE_TASK_LIST_TASK_EXPAND_TOGGLE: {
      const tasks = [...state.taskList]
      tasks[action.index].__gm_expanded = !tasks[action.index].__gm_expanded

      return Object.assign({}, state, {
        taskList: tasks,
      })
    }

    case actionTypes.PURCHASE_TASK_PRINT: {
      return Object.assign({}, state, {
        printList: action.data,
      })
    }

    case actionTypes.PURCHASE_TASK_LIST_SELECT_SINGLE: {
      const taskList = state.taskList.slice()
      resetSelected(taskList)
      _.forEach(action.selected, (taskIndex) => {
        const task = taskList[taskIndex]
        task._gm_select = true
        const tasksBE = task.tasks.slice()
        task.tasks = _.map(tasksBE, (t) => {
          t._gm_select = true
          return t
        })
      })
      return Object.assign({}, state, {
        taskList,
        taskListSelected: action.selected,
      })
    }

    case actionTypes.PURCHASE_TASK_LIST_SELECT_ALL: {
      const taskList = _.map(state.taskList.slice(), (task) => {
        task._gm_select = action.checked
        _.each(task.tasks, (order) => {
          order._gm_select = action.checked
        })
        return task
      })

      const selected = []
      _.forEach(state.taskList, (task, index) => {
        action.checked && task.status !== 3 && selected.push(index)
      })

      return Object.assign({}, state, {
        taskList,
        taskListSelected: selected,
      })
    }

    case actionTypes.PURCHASE_TASK_ORDER_SELECT_SINGLE: {
      const taskListItem = [...state.taskListItem]
      const { task, orderIndex, checked } = action
      task.tasks[orderIndex]._gm_select = checked

      const isNotAllSelected = _.find(task.tasks, (t) => !t._gm_select)

      if (!isNotAllSelected) {
        task._gm_select = true
      } else {
        task._gm_select = false
      }

      return Object.assign({}, state, {
        taskListItem,
      })
    }

    case actionTypes.PURCHASE_TASK_ORDER_SELECT_ALL: {
      const taskListItem = [...state.taskListItem]
      const { task } = action
      task.tasks = task.tasks.map((task) => {
        task._gm_select = action.checked
        return task
      })

      return Object.assign({}, state, {
        taskListItem,
      })
    }

    case actionTypes.PURCHASE_TASK_SIDE_BAR_CHOOSE_ID: {
      return Object.assign({}, state, {
        supplierPurchaserId: action.id,
      })
    }

    case actionTypes.PURCHASE_TASK_SIDE_BAR_CHOOSE_ID_CLEAR: {
      return Object.assign({}, state, {
        supplierPurchaserId: null,
      })
    }

    case actionTypes.PURCHASE_TASK_ORDER_SUPPLIER_EDIT_TOGGLE: {
      const { taskItem } = action
      const taskList = [...state.taskList]
      const _supplier_edit = taskItem._supplier_edit

      if (_supplier_edit) {
        taskItem._supplier_edit_selected = null
      } else {
        taskItem._supplier_edit_selected = {
          id: taskItem.settle_supplier_id,
          name: taskItem.settle_supplier_name,
        }
      }

      taskItem._supplier_edit = !_supplier_edit

      return Object.assign({}, state, {
        taskList,
      })
    }

    case actionTypes.PURCHASE_TASK_ORDER_SUPPLIER_CHANGE: {
      const { task, orderIndex } = action
      const taskList = [...state.taskList]
      const taskItem = orderIndex === null ? task : task.tasks[orderIndex]

      taskItem._supplier_edit_selected = action.supplier

      return Object.assign({}, state, {
        taskList,
      })
    }

    case actionTypes.PURCHASE_TASK_ORDER_SUPPLIER_UPDATE: {
      const { taskItem } = action
      const taskList = [...state.taskList]

      taskItem.settle_supplier_id = action.supplier.id
      taskItem.settle_supplier_name = action.supplier.name
      // taskItem._supplier_edit_selected = null;
      // taskItem._supplier_edit = false;

      return Object.assign({}, state, {
        taskList,
      })
    }

    case actionTypes.PURCHASE_TASK_SUPPLIER_CAN_CHANGE_GET: {
      return Object.assign({}, state, {
        taskSupplierMap: {
          ...state.taskSupplierMap,
          ...{
            [action.spec_id]: action.data,
          },
        },
      })
    }

    case actionTypes.PURCHASE_ITEM_RESET:
      return Object.assign({}, state, {
        purchaseItem: {
          items: [],
          settle_supplier_avail: [],
        },
      })

    case actionTypes.PURCHASE_ITEM_GET: {
      const { items, settle_supplier_avail } = action.data
      const supplierPurchaseMap = {}

      // 计算供应商的计划采购
      _.each(items, (item) => {
        if (!supplierPurchaseMap[item.settle_supplier_id]) {
          supplierPurchaseMap[item.settle_supplier_id] = {}
        }

        if (supplierPurchaseMap[item.settle_supplier_id].plan_amount) {
          supplierPurchaseMap[item.settle_supplier_id].plan_amount +=
            item.plan_amount
        } else {
          supplierPurchaseMap[item.settle_supplier_id].plan_amount =
            item.plan_amount
        }
      })

      _.each(settle_supplier_avail, (supplier) => {
        if (supplierPurchaseMap[supplier.id]) {
          supplier.plan_amount = supplierPurchaseMap[supplier.id].plan_amount
        }
      })

      return Object.assign({}, state, {
        purchaseItem: {
          ...action.data,
        },
      })
    }

    case actionTypes.PURCHASE_ITEM_SELECT: {
      const items = [...state.purchaseItem.items]

      if (items[action.index].editable) {
        items[action.index]._gm_select = action.checked
      }

      return Object.assign({}, state, {
        purchaseItem: Object.assign({}, state.purchaseItem, { items }),
      })
    }

    case actionTypes.PURCHASE_ITEM_SELECT_ALL: {
      const items = _.map(state.purchaseItem.items, (item) => {
        if (item.editable) {
          item._gm_select = action.checked
        }
        return item
      })

      return Object.assign({}, state, {
        purchaseItem: Object.assign({}, state.purchaseItem, { items }),
      })
    }

    case actionTypes.PURCHASE_HISTORY_GET:
      return Object.assign({}, state, {
        purchaseHistory: action.data,
      })

    case actionTypes.PURCHASE_SOURCER_INIT:
      return Object.assign({}, state, {
        purchaseSourcer: [],
      })

    case actionTypes.PURCHASE_SOURCER_SEARCH:
      action.data.forEach((item) => {
        item.value = item.id
        item.text = item.name
      })
      return Object.assign({}, state, {
        purchaseSourcer: action.data,
      })

    case actionTypes.PURCHASE_TASK_SETTLE_SUPPLIER_GET:
      return {
        ...state,
        canUpdateSupliers: action.data,
      }

    case actionTypes.PURCHASE_REFERENCE_PRICE_TYPE: {
      return Object.assign({}, state, {
        reference_price_type: action.data,
      })
    }

    case actionTypes.PURCHASE_TASK_GET_CHILD_STATIONS: {
      return Object.assign({}, state, {
        siteList: action.data,
      })
    }

    case actionTypes.PURCHASE_GET_ADDRESS_LABEL: {
      return {
        ...state,
        addressLabelList: action.data,
      }
    }

    case actionTypes.PURCHASE_GET_ADDRESS_LIST: {
      return {
        ...state,
        merchandiseList: action.data,
      }
    }

    default:
      return state
  }
}
const storageOptions = {}
storageOptions.purchase_task = {
  selector: ['headerFilter.dateType'],
  name: ACTION_STORAGE_KEY_NAMES.PURCHASE_TASK,
}

mapActionStorage(reducers, storageOptions)
mapReducers(reducers)
