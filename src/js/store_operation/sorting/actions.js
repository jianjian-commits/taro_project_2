import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types.js'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'
import moment from 'moment'
import _ from 'lodash'
import { Tip } from '@gmfe/react'
import { calculateCycleTime } from '../../common/util'
const actions = {}

// 商品筛选
const getCategory1 = () => Request('/merchandise/category1/get').get()
const getCategory2 = () => Request('/merchandise/category2/get').get()
const getPinlei = () => Request('/merchandise/pinlei/get').get()
const getCategoryIdArr = (list) =>
  list.length ? JSON.stringify(_.map(list, (item) => item.id)) : null
const convertTime = (time) => moment(time).format('YYYY-MM-DD HH:mm')
const convertBool = (flag) => {
  const len = `${flag}`.length
  if (!len) {
    return null
  } else if (len === 1) {
    return Number(flag)
  } else {
    return Number(flag[1])
  }
}

actions.sorting_change_loading = (loading) => {
  return {
    type: actionTypes.SORTING_CHANGE_LOADING,
    loading,
  }
}

actions.sorting_get_task_cycle = (query) => {
  return (dispatch) => {
    return Request('/service_time/cycle_start_time')
      .data(query)
      .get()
      .then((json) => {
        const data = json.data
        dispatch({
          type: actionTypes.SORTING_GET_TASK_CYCLE,
          cycle: data,
        })
      })
  }
}

actions.sorting_change_cycle_selected = (itemId) => {
  return {
    type: actionTypes.SORTING_CHANGE_CYCLE_SELECTED,
    itemId,
  }
}

actions.sorting_change_contain_outer = (checked) => {
  return {
    type: actionTypes.SORTING_CHANGE_CONTAINER_OUTER,
    checked,
  }
}

actions.sorting_get_sorting_list = (query) => {
  return (dispatch) => {
    return Request('/station/task/sorting/label', { timeout: 30000 })
      .data(query)
      .get()
      .then((json) => {
        const data = json.data
        dispatch({
          type: actionTypes.SORTING_GET_SORTING_LIST,
          sortingList: data,
        })
      })
  }
}

actions.sorting_active_the_batch = (query) => {
  return (dispatch) =>
    Request('/station/task/sorting/batch', { timeout: 120000 })
      .data(query)
      .get()
      .then(() => {
        dispatch({
          type: actionTypes.SORTING_ACTIVE_THE_BATCH,
        })
      })
      .catch(() => {
        dispatch({
          type: actionTypes.SORTING_ACTIVE_THE_BATCH,
        })
      })
}

// 获取运营时间
actions.sorting_get_service_time = () => {
  return (dispatch) => {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const data = json.data
        dispatch({
          type: actionTypes.SORTING_GET_SERVICE_TIME,
          serviceTime: data,
        })
      })
  }
}

// 商品筛选 一级分类 二级分类
actions.sorting_merchandise_filter_get_all = () => {
  return (dispatch, getState) => {
    const categories = []
    const cate1Map = {}
    const cate2Map = {}
    const pinleiMap = {}
    const categoryList = getState().sorting.detail.categoryList
    // 如果存在不走网络接口
    if (categoryList.length) {
      dispatch({
        type: actionTypes.SORTING_MERCHANDISE_FILTER_GET_ALL,
        data: categoryList,
      })
      return Promise.resolve(categories)
    }
    return Promise.all([getCategory1(), getCategory2(), getPinlei()]).then(
      (result) => {
        const category1 = result[0].data
        const category2 = result[1].data
        const pinlei = result[2].data

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
          if (cate2Map[pl.upstream_id] && cate2Map[pl.upstream_id].children) {
            cate2Map[pl.upstream_id].children.push(pl)
          }
        })

        dispatch({
          type: actionTypes.SORTING_MERCHANDISE_FILTER_GET_ALL,
          data: categories,
        })
        return categories
      }
    )
  }
}

// 获取报价单
actions.sorting_detail_get_sale_list = () => {
  return (dispatch) => {
    Request('/salemenu/sale/list')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SORTING_DETAIL_GET_SALE_LIST,
          data: json.data,
        })
      })
  }
}

// 获取分拣备注列表信息
actions.sorting_batch_list_get_all = () => {
  return (dispatch, getState) => {
    dispatch(actions.get_filter_data())
    const paramsTemp = getState().sorting.detail.filterData
    const query = {
      query_type: 2,
      time_config_id: paramsTemp.time_config_id,
      cycle_start_time: convertTime(paramsTemp.start_date),
      cycle_end_time: convertTime(paramsTemp.end_date),
    }
    return Request('/station/order/remark/get')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SORTING_BATCH_LIST_GET_ALL,
          data: json.data,
        })
      })
  }
}

// 线路筛选
actions.sorting_detail_get_route_list = (query = { limit: 1000 }) => {
  return (dispatch) => {
    return Request('/station/address_route/list')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SORTING_DETAIL_GET_ROUTE_LIST,
          data: json.data || [],
        })
      })
  }
}

// 分拣进度和分拣明细共用
actions.sorting_select_filter_change = (tab, filter) => {
  return (dispatch) => {
    return dispatch({
      type: actionTypes.SORTING_SELECT_FILTER_CHANGE,
      filter,
      tab,
    })
  }
}

actions.sorting_get_schedule_search_data = () => {
  return (dispatch, getState) => {
    const { serviceTime, schedule } = getState().sorting
    const { targetDate, time_config_id } = schedule.filter
    const service_time = _.find(serviceTime, (s) => s._id === time_config_id)
    const query = {
      time_config_id,
      target_date: calculateCycleTime(targetDate, service_time).begin,
    }
    return Request('/weight/weight_collect/weight_info/get')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SORTING_GET_SCHEDULE_SEARCH_DATA,
          schedule: json.data,
        })
      })
  }
}

actions.get_filter_data = () => {
  return (dispatch, getState) => {
    const { serviceTime, detail } = getState().sorting
    const {
      time_config_id,
      begin,
      end,
      searchText,
      categorySelected,
      batchRemark,
      isWeigh,
      weighed,
      printed,
      salemenuSelectd,
      routeId,
      status,
      inspect_status,
    } = detail.filter
    const salemenu_id = salemenuSelectd && salemenuSelectd.id
    const { category1_ids, category2_ids, pinlei_ids } = categorySelected
    const service_time = _.find(serviceTime, (s) => s._id === time_config_id)
    const data = {
      time_config_id,
      start_date: calculateCycleTime(begin, service_time).begin,
      end_date: calculateCycleTime(end, service_time).end,
      search: searchText,
      category_id_1: getCategoryIdArr(category1_ids),
      category_id_2: getCategoryIdArr(category2_ids),
      pinlei_id: getCategoryIdArr(pinlei_ids),
      remark: !batchRemark ? null : batchRemark,
      is_weight: convertBool(isWeigh),
      weighted: convertBool(weighed),
      printed: convertBool(printed),
      status: !status ? null : status,
      salemenu_id: !salemenu_id ? null : salemenu_id,
      route_id: routeId && routeId.value,
      inspect_status: inspect_status === '' ? null : inspect_status,
    }
    dispatch({
      type: actionTypes.GET_FILTER_DATA,
      data,
    })
  }
}

actions.sorting_get_detail_search_data = (pagination) => {
  return (dispatch, getState) => {
    dispatch(actions.get_filter_data())
    const paramsTemp = getState().sorting.detail.filterData
    console.log(getState())
    const params = Object.assign({}, paramsTemp, pagination)

    return Request('/weight/weight_collect/task/list')
      .data(params)
      .get()
      .then((json) => {
        const data = _.map(json.data, (item) => {
          item.id = `${item.order_id}_${item.sku_id}${
            item.source_order_id ? `_${item.source_order_id}` : ''
          }`
          return item
        })
        dispatch({
          type: actionTypes.SORTING_GET_DETAIL_SEARCH_DATA,
          data,
        })
        return json
      })
  }
}

actions.sorting_view_sku_list_sku_select = (
  isOldOrderEditable = false,
  data
) => {
  return {
    type: actionTypes.SORTING_VIEW_SKU_LIST_SKU_SELECT,
    isOldOrderEditable,
    data,
  }
}

actions.sorting_sku_set_weight = (data) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SORTING_GET_DETAIL_SEARCH_DATA,
      data,
    })
    return Promise.resolve()
  }
}

mapActions(actions)
