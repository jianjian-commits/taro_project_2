import { i18next } from 'gm-i18n'
import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action_types.js'
import { Request } from '@gm-common/request'
import { Tip } from '@gmfe/react'
import _ from 'lodash'
import { DBActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'
import globalStore from '../../stores/global'
import { System } from '../../common/service'
import { convertNumber2Sid } from '../../common/filter.js'

const actions = {}

const getCategory1 = () => Request('/merchandise/category1/get').get()
const getCategory2 = () => Request('/merchandise/category2/get').get()
const getPinlei = () => Request('/merchandise/pinlei/get').get()
const getRouteList = () =>
  Request('/station/address_route/list').data({ limit: 1000 }).get()

actions.purchase_task_get_filter_init_data = () => {
  return (dispatch) => {
    const categories = []
    const cate1Map = {}
    const cate2Map = {}
    const pinleiMap = {}

    return Promise.all([
      getCategory1(),
      getCategory2(),
      getPinlei(),
      Request('/purchase/task/settle_suppliers').get(),
      getRouteList(),
    ]).then((result) => {
      const category1 = result[0].data
      const category2 = result[1].data
      const pinlei = result[2].data
      const _suppliers = result[3].data
      const routes = result[4].data

      _.forEach(category1, (cate1) => {
        cate1Map[cate1.id] = cate1
        cate1.children = []
        categories.push(cate1)
      })

      _.forEach(category2, (cate2) => {
        cate2Map[cate2.id] = cate2
        cate2.children = []
        if (
          cate1Map[cate2.upstream_id] &&
          cate1Map[cate2.upstream_id].children
        ) {
          cate1Map[cate2.upstream_id].children.push(cate2)
        }
      })

      _.forEach(pinlei, (pl) => {
        pinleiMap[pl.id] = pl
        cate2Map[pl.upstream_id].children.push(pl)
      })

      const routeList = _.map(routes, (item) => {
        return {
          value: item.id,
          name: item.name,
        }
      })
      routeList.push({ value: -1, name: i18next.t('无线路') })

      // suppliers需要转换成{ value: '', text: '' 形式}
      _suppliers.push({ id: '-1', name: i18next.t('无供应商') })
      const suppliers = _.map(_suppliers, (supplier) => ({
        ...supplier,
        value: supplier.id,
        text: supplier.name,
      }))

      dispatch({
        type: actionTypes.PURCHASE_TASK_GET_FILTER_INIT_DATA,
        data: {
          categories,
          suppliers,
          routeList,
        },
      })
    })
  }
}

actions.purchase_task_header_filter_clear = () => {
  return {
    type: actionTypes.PURCHASE_TASK_HEADER_FILTER_CLEAR,
  }
}

actions.purchase_task_select_route = (route_id) => {
  return {
    type: actionTypes.PURCHASE_TASK_SELECT_ROUTE,
    route_id,
  }
}

actions.purchase_list_get_all_supplier_purchaser = (query) => {
  return (dispatch) => {
    return Request('/purchase/task/suppliers/summary')
      .data(query)
      .get()
      .then((json) => {
        // 优化没有供应商显示时，显示待分配供应商提示用户 增加settle_supplier_id来修复
        const data = _.map(json?.data?.suppliers, (item) => {
          if (!item.settle_supplier_name) {
            item = {
              ...item,
              settle_supplier_name: '待分配供应商',
              settle_supplier_id: '-1',
            }
          }
          return item
        })
        dispatch({
          type: actionTypes.PURCHASE_LIST_GET_ALL_SUPPLIER_PURCHASER,
          data: { ...json.data, suppliers: data },
        })
      })
  }
}

actions.purchase_task_pagination_reset = () => {
  return {
    type: actionTypes.PURCHASE_TASK_PAGINATION_RESET,
  }
}

actions.purchase_task_header_filter_change = (data, isPurchaseBar = false) => {
  return (dispatch, getState) => {
    const { time_config_id } = data
    if (time_config_id) {
      // 更新 local 服务时间
      DBActionStorage.set(
        ACTION_STORAGE_KEY_NAMES.PURCHASE_TASK_TIME,
        time_config_id,
      )
    }

    // 可能需要处理一下选择全部供应商

    const { suppliers, purchaseSourcer } = getState().purchase_task
    // 表示从右侧总览选择的数据，只传了id，需要处理一下
    if (isPurchaseBar) {
      if (data.supplier !== undefined) {
        const new_supplier =
          data.supplier === null
            ? []
            : _.filter(suppliers, (s) => s.id === data.supplier.id)
        // 供应商是多选，id为null需要处理成筛选空数组
        data = { ...data, supplier: new_supplier }
      }

      if (data.purchaser) {
        const new_purchaser = _.find(
          purchaseSourcer,
          (p) => p.id === data.purchaser.id,
        )
        data = { ...data, purchaser: new_purchaser }
      }
    }

    dispatch({
      type: actionTypes.PURCHASE_TASK_HEADER_FILTER_CHANGE,
      data,
    })
  }
}

actions.purchase_task_batch_modify_change = (data) => {
  return {
    type: actionTypes.PURCHASE_TASK_BATCH_MODIFY_CHANGE,
    data,
  }
}

actions.purchase_task_batch_modify_get = (query) => {
  return (dispatch) => {
    return Request('/purchase/task/change_suppliers_purchasers')
      .data(query)
      .post()
      .then((json) => {
        // 返回异步任务 id，暂没有用
        return json
      })
  }
}

function addQuotePrice(list) {
  return _.map(list, (item) => {
    return {
      ...item,
      ...{
        last_in_stock_price: item.last_in_stock_price.newest.price,
        last_purchase_price: item.last_purchase_price.newest.price,
        last_quote_price: item.last_quote_price.newest.price,
        last_in_stock_price_newest: item.last_in_stock_price.newest,
        last_purchase_price_newest: item.last_purchase_price.newest,
        last_quote_price_newest: item.last_quote_price.newest,
        last_in_stock_price_earlier: item.last_in_stock_price.earlier || [],
        last_purchase_price_earlier: item.last_purchase_price.earlier || [],
        last_quote_price_earlier: item.last_quote_price.earlier || [],
      },
    }
  })
}
async function addSupplyRemain(list, options) {
  if (list.length <= 0) {
    return list
  }
  const params = _.pick(options, [
    'q_type',
    'begin_time',
    'end_time',
    'time_config_id',
    'is_new_ui',
  ])
  const supplierSpec = []
  _.each(list, (item) => {
    supplierSpec.push({
      supplier_id: item.settle_supplier_id,
      sku_id: item.spec_id,
    })
  })
  params.supplier_spec = JSON.stringify(supplierSpec)
  // 兼容
  params.new_search = window.____template_type
  const { data: supplierAmountList } = await Request(
    '/purchase/task/search/supply_limit',
  )
    .data(params)
    .get()
  _.each(list, (item, i) => {
    const amount = supplierAmountList[i]
    item.supplier_distribute_amount = amount.supplier_distribute_amount
    item.supplier_purchased_amount = amount.supplier_purchased_amount
    item.supply_limit = amount.supply_limit
    if (_.isNil(amount.supply_limit) || amount.supply_limit === '') {
      item.supply_remain = ''
    } else {
      item.supply_remain =
        amount.supply_limit - amount.supplier_distribute_amount
    }
  })
  return list
}
async function getInTransitStock(list, params) {
  const arr = []
  const { data } = await Request('/purchase/task/in_transit_stock')
    .data(params)
    .get()
  _.each(list, (item) => {
    const target = data[item.spec_id] < 0 ? 0 : data[item.spec_id]
    arr.push({
      ...item,
      in_transit_stock: target,
    })
  })
  return arr
}

actions.purchase_task_list_search = (options) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.PURCHASE_TASK_LIST_SEARCH_LOADING,
    })

    return Request('/purchase/task/new_search', { timeout: 60000 })
      .data(options)
      .get()
      .then(async (json) => {
        // 展开参考成本 询价/最近采购价...
        const spec_ids = _.map(json.data, (i) => i.spec_id)
        let list = addQuotePrice(json.data)
        list = await addSupplyRemain(list, options)
        list = await getInTransitStock(list, {
          spec_ids: JSON.stringify(spec_ids),
          time_config_id: options.time_config_id || null,
          begin_time: options.begin_time,
          end_time: options.end_time,
          q_type: options.q_type,
          is_new_ui: options.is_new_ui,
        })
        dispatch({
          type: actionTypes.PURCHASE_TASK_LIST_SEARCH,
          data: _.map(list, (item, index) => ({ ...item, _index: index })),
          pagination: {
            ...json.pagination,
            count: json.pagination === undefined ? 0 : json.pagination.count,
          },
          currentPage: {
            page_obj: options.page_obj || null,
            reverse: options.reverse,
          },
        })
        return {
          ...json,
          pagination: json.pagination ? json.pagination : {},
        }
      })
      .then((data) => {
        dispatch({
          type: actionTypes.PURCHASE_TASK_LIST_SELECT_ALL,
          checked: false,
        })
        return data
      })
      .catch((e) => {
        console.error(e)
        dispatch({
          type: actionTypes.PURCHASE_TASK_LIST_SEARCH_ERROR,
        })
      })
  }
}

actions.setPagination = (data) => {
  return (dispatch, getState) => {
    const { offset, limit } = getState().purchase_task.taskListPagination
    dispatch({
      type: actionTypes.PURCHASE_TASK_LIST_PAGINATION,
      offset: data.offset === undefined ? offset : data.offset,
      limit: data.limit === undefined ? limit : data.limit,
    })
  }
}

actions.refreshTaskList = (idsMap) => {
  return (dispatch, getState) => {
    const { taskListItem } = getState().purchase_task
    const { tasks } = taskListItem[0]
    const newTasks = _.differenceBy(tasks, idsMap, 'id')
    dispatch({
      type: actionTypes.PURCHASE_TASK_LIST_SEARCH_ITEM,
      data: [
        {
          ...taskListItem[0],
          tasks: newTasks,
        },
      ],
    })
  }
}

// 传入确定且唯一的一个元素list
actions.purchase_set_task_list = (taskList) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.PURCHASE_TASK_LIST_SEARCH_ITEM,
      data: taskList,
    })
  }
}

actions.purchase_task_list_search_item_clear = () => {
  return {
    type: actionTypes.PURCHASE_TASK_LIST_SEARCH_ITEM_CLEAR,
  }
}

actions.purchase_task_realease = (task_ids, releaseOptions) => {
  return () => {
    return Request('/purchase/task/release')
      .data({
        task_ids: JSON.stringify(task_ids),
        ...releaseOptions,
      })
      .post()
  }
}

actions.purchase_task_print = (options) => {
  return (dispatch) => {
    return Request('/purchase/task/print', { timeout: 60000 })
      .data({
        ...options,
        is_print: 1,
      })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_TASK_PRINT,
          data: json.data,
        })

        return json.data
      })
  }
}

actions.purchase_task_sheet_create = (release_ids, releaseOptions) => {
  return () => {
    return Request('/purchase/task/create_sheet')
      .data({
        release_ids: JSON.stringify(release_ids),
        ...releaseOptions,
      })
      .post()
      .then((json) => {
        if (!json.data.length) {
          Tip.info(i18next.t('没有新的采购单据生成'))
          return Promise.reject(i18next.t('没有新的采购单据生成'))
        }

        return json.data
      })
  }
}

actions.purchase_task_supplier_can_change_get = (params) => {
  return (dispatch) => {
    const spec_id = params.spec_id
    Request('/purchase/task/settle_suppliers_can_change')
      .data(params)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_TASK_SUPPLIER_CAN_CHANGE_GET,
          data: json.data,
          spec_id,
        })
      })
  }
}

actions.purchase_task_list_select_single = (selected) => {
  return {
    type: actionTypes.PURCHASE_TASK_LIST_SELECT_SINGLE,
    selected,
  }
}

actions.purchase_task_list_select_all = (checked) => {
  return {
    type: actionTypes.PURCHASE_TASK_LIST_SELECT_ALL,
    checked,
  }
}

actions.purchase_task_order_select = (task, checked, orderIndex) => {
  if (orderIndex !== undefined) {
    return {
      type: actionTypes.PURCHASE_TASK_ORDER_SELECT_SINGLE,
      task,
      orderIndex,
      checked,
    }
  }

  return {
    type: actionTypes.PURCHASE_TASK_ORDER_SELECT_ALL,
    task,
    checked,
  }
}

actions.purchase_task_order_supplier_edit_toggle = (taskItem) => {
  return {
    type: actionTypes.PURCHASE_TASK_ORDER_SUPPLIER_EDIT_TOGGLE,
    taskItem,
  }
}

actions.purchase_task_order_supplier_change = (task, orderIndex, supplier) => {
  return {
    type: actionTypes.PURCHASE_TASK_ORDER_SUPPLIER_CHANGE,
    task,
    orderIndex,
    supplier,
  }
}

actions.purchase_task_side_bar_choose_id = (id) => {
  return {
    type: actionTypes.PURCHASE_TASK_SIDE_BAR_CHOOSE_ID,
    id,
  }
}

actions.purchase_task_side_bar_choose_id_clear = () => {
  return {
    type: actionTypes.PURCHASE_TASK_SIDE_BAR_CHOOSE_ID_CLEAR,
  }
}

actions.purchase_task_order_supplier_update = (taskItem, supplier) => {
  return {
    type: actionTypes.PURCHASE_TASK_ORDER_SUPPLIER_UPDATE,
    taskItem,
    supplier,
  }
}

actions.purchase_task_list_task_expand = (index) => {
  return {
    type: actionTypes.PURCHASE_TASK_LIST_TASK_EXPAND_TOGGLE,
    index,
  }
}

actions.purchase_item_get = (
  sku_id,
  release_id,
  settle_supplier_id,
  time_config_id,
  begin_time,
  end_time,
  q_type,
) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.PURCHASE_ITEM_RESET,
    })
    return Request('/station/task/purchase/item')
      .data({
        sku_id,
        release_id,
        settle_supplier_id,
        time_config_id,
        begin_time,
        end_time,
        q_type,
      })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_ITEM_GET,
          data: json.data,
        })
      })
  }
}

actions.purchase_item_resource_get = (spu_id) => {
  return () => {
    return Request('/purchase/task/get_create_source')
      .data({ spu_id })
      .get()
      .then((json) => {
        return json.data
      })
  }
}

actions.purchase_item_select = (checked, index) => {
  if (index !== undefined) {
    return {
      type: actionTypes.PURCHASE_ITEM_SELECT,
      index,
      checked,
    }
  }

  return {
    type: actionTypes.PURCHASE_ITEM_SELECT_ALL,
    checked,
  }
}

actions.purchase_item_supplier_update = (
  ids,
  { settle_supplier_id = null, purchaser_id = null },
) => {
  return () => {
    return Request('/purchase/task/change_settle_supplier')
      .data({
        ids: JSON.stringify(ids),
        settle_supplier_id,
        purchaser_id,
      })
      .post()
  }
}

actions.purchase_item_del = (id) => {
  return () => {
    return Request('/purchase/task/item/delete').data({ id }).post()
  }
}

actions.purchase_history_get = (
  sku_id,
  release_id,
  q_type,
  begin_time,
  end_time,
) => {
  return (dispatch) => {
    Request('/purchase/task/history')
      .data({
        sku_id,
        release_id,
        q_type,
        begin_time,
        end_time,
        is_new_ui: 1,
      })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_HISTORY_GET,
          data: json.data,
        })
      })
  }
}

actions.purchase_sourcer_modify = (index, key, value) => {
  return (dispatch, getState) => {
    const list = getState().purchase_task.purchaseSourcer
    list[index][key] = value
    dispatch({
      type: actionTypes.PURCHASE_SOURCER_SEARCH,
      data: list,
    })
  }
}

actions.purchase_sourcer_search = (search_text, pagination) => {
  const parmas = pagination
    ? {
        search_text,
        offset: pagination.offset,
        limit: pagination.limit,
        count: 1,
        is_page: 1,
      }
    : {
        search_text,
      }
  return (dispatch) => {
    return Request('/purchase/purchaser/search')
      .data(parmas)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_SOURCER_SEARCH,
          data: _.map(json.data, (item) => {
            const list = _.map(item.settle_suppliers, (v) => ({
              value: v.id,
              text: v.name,
            }))
            return {
              ...item,
              settle_suppliers: list,
              settle_suppliers_be: list,
            }
          }),
        })
        return json
      })
  }
}

actions.purchase_task_settle_supplier_get = () => {
  return (dispatch) => {
    return Request('/stock/settle_supplier/get')
      .get()
      .then((json) => {
        let data = json.data[0].settle_suppliers
        data = _.map(data, (item) => {
          return {
            ...item,
            id: item.settle_supplier_id,
          }
        })
        dispatch({
          type: actionTypes.PURCHASE_TASK_SETTLE_SUPPLIER_GET,
          data,
        })
        return data
      })
  }
}

actions.purchase_sourcer_del = (id) => {
  return () => {
    return Request('/purchase/purchaser/delete').data({ id }).post()
  }
}

actions.purchase_sourcer_init = () => {
  return {
    type: actionTypes.PURCHASE_SOURCER_INIT,
  }
}

actions.supplier_list_get = () => {
  return () => {
    return Request('/supplier/search')
      .data()
      .get()
      .then((json) => {
        const result = _.map(json.data, (item) => {
          return {
            id: item.supplier_id,
            name: item.name,
          }
        })
        return result
      })
  }
}

actions.purchase_sourcer_edit_supplier = (id, settle_suppliers) => {
  return () => {
    return Request('/purchase/purchaser/edit')
      .data({ id, settle_suppliers })
      .post()
  }
}

actions.purchase_sourcer_update = ({
  name,
  userName,
  is_allow_login,
  password,
  phone,
  settle_suppliers,
  status,
  id,
  edit_protocol_price,
}) => {
  return () => {
    if (id) {
      return Request('/purchase/purchaser/edit')
        .data({
          name,
          phone,
          settle_suppliers: JSON.stringify(settle_suppliers),
          status: status ? 1 : 0,
          id,
          password,
          is_allow_login: is_allow_login ? 1 : 0,
          edit_protocol_price: edit_protocol_price ? 1 : 0,
        })
        .post()
    } else {
      return Request('/purchase/purchaser/create')
        .data({
          password,
          name,
          username: userName,
          phone,
          is_allow_login: is_allow_login ? 1 : 0,
          settle_suppliers: JSON.stringify(settle_suppliers),
          status: status ? 1 : 0,
          edit_protocol_price: edit_protocol_price ? 1 : 0,
        })
        .post()
    }
  }
}

// 产品说 limit先放开到30条
actions.purchase_item_spus_get = (q) => {
  return () => {
    return Request('/merchandise/spu/branch')
      .data({ q, limit: 30, is_retail_interface: System.isC() ? 1 : null })
      .get()
  }
}

actions.purchase_item_create = (
  settle_supplier_id,
  sku_id,
  plan_purchase_amount,
  time_config_id,
  cycle_start_time,
  isRelatedTasksCycle,
) => {
  const data = {
    settle_supplier_id,
    sku_id,
    plan_purchase_amount,
  }

  isRelatedTasksCycle && (data.cycle_start_time = cycle_start_time)
  isRelatedTasksCycle && (data.time_config_id = time_config_id)

  return () => {
    return Request('/purchase/task/create').data(data).post()
  }
}

actions.purchase_task_get_service_time = () => {
  return (dispatch, getState) => {
    const query = {}
    if (globalStore.isSupply()) {
      query.station_id = globalStore.purchaseInfo.seller_station_id
    }
    return Request('/service_time/list')
      .data(query)
      .get()
      .then((json) => {
        console.log(json);
        const serviceTimes = json.data
        dispatch({
          type: actionTypes.PURCHASE_TASK_GET_SERVICE_TIME,
          serviceTimes,
        })
        const time_config_id = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.PURCHASE_TASK_TIME,
        )
        const { initServiceTimeId } = DBActionStorage.helper
        const curId = getState().purchase_task.headerFilter.time_config_id
        // 更新运营时间
        initServiceTimeId(curId, time_config_id, serviceTimes, (val) => {
          const filterObj = { time_config_id: val }
          dispatch(actions.purchase_task_header_filter_change(filterObj))
        })
        return json.data
      })
  }
}

actions.purchase_task_get_reference_price_type = (data) => {
  return (dispatch) => {
    return Request('/station/ref_price_type/get')
      .data({ where: data })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_REFERENCE_PRICE_TYPE,
          data: json.data.type || 1,
        })
        return json
      })
  }
}

actions.purchase_task_set_reference_price_type = (type) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.PURCHASE_REFERENCE_PRICE_TYPE,
      data: type || 1,
    })
  }
}

// 获取采购员详情
actions.purchase_sourcer_get_detail = (id) => {
  return () => {
    return Request('/purchase/purchaser/detail').data({ id }).get()
  }
}

// actions.purchase_market_information = spec_id => {
//   return dispatch => {
//     Request('/purchase/task/market_information')
//       .data({
//         spec_id
//       })
//       .get()
//       .then(json => {
//         dispatch({
//           type: actionTypes.PURCHASE_MARKET_INFORMATION,
//           data: json.data
//         })
//       })
//   }
// }

// 根据查询条件获取采购任务分享token
actions.purchase_get_task_token = (options) => {
  return () => {
    return Request('/purchase/task/share_token').data(options).get()
  }
}

// 修改单次可供应上限
actions.purchase_task_supply_limit_change = (params) => {
  return () => {
    return Request('/purchase/task/change_supply_limit').data(params).post()
  }
}

actions.purchase_get_child_stations = (parmas) => {
  return (dispatch) => {
    Request('/station/child_stations')
      .get()
      .then((json) => {
        const siteList = [
          { name: '全部', id: '' },
          { name: parmas.station_name, id: parmas.station_id },
        ].concat(json.data)
        dispatch({
          type: actionTypes.PURCHASE_TASK_GET_CHILD_STATIONS,
          data: siteList,
        })
      })
  }
}

// 获取商户标签
actions.purchase_get_address_label = () => {
  return (dispatch) => {
    Request('/station/address_label/list')
      .get()
      .then((json) => {
        const list = [{ value: -1, text: i18next.t('无商户标签') }].concat(
          _.map(json.data, (item) => ({
            value: item.id,
            text: item.name,
          })),
        )
        dispatch({
          type: actionTypes.PURCHASE_GET_ADDRESS_LABEL,
          data: list,
        })
      })
  }
}

actions.purchase_get_address_list = () => {
  return (dispatch) => {
    Request('/station/order/customer/search')
      .get()
      .then((json) => {
        const list = _.map(json.data.list, (item) => ({
          value: item.address_id,
          text: `${item.resname}(${convertNumber2Sid(item.address_id)}/${
            item.username
          }/${item.res_custom_code})`,
        }))
        dispatch({
          type: actionTypes.PURCHASE_GET_ADDRESS_LIST,
          data: list,
        })
      })
  }
}

mapActions(actions)
