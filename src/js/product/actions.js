import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { DBActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../common/action_storage_key_names'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { getShelfSelectedValueForCascade } from '../common/util'
import { action } from 'mobx'

const actions = {}

// 拉取供应商
actions.product_suppliers = () => {
  return (dispatch) => {
    return Request('/stock/settle_supplier/get')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_SUPPLIERS,
          supplyGroup: json.data,
        })
        return json
      })
  }
}

actions.product_selected_supplier = (selectSupplier) => {
  return {
    type: actionTypes.PRODUCT_SELECTED_SUPPLIER,
    selectSupplier,
  }
}

// 入库退货获取商品列表
actions.product_sku_list = (data, index) => {
  return (dispatch) => {
    return Request('/stock/in_stock_sku/supply_sku')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_SKU_LIST,
          list: json.data,
          index,
        })
        return json
      })
  }
}

// 出库获取商品列表
actions.product_out_stock_sku_list = (name, index) => {
  return (dispatch) => {
    return Request('/stock/search_sale_sku')
      .data({ name })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_SKU_LIST,
          list: json.data,
          index,
        })
        return json
      })
  }
}

// 获取存放货位列表
actions.product_in_stock_shelf_list = () => {
  return (dispatch) => {
    return Request('/stock/shelf/get')
      .get()
      .then(
        (json) => {
          dispatch({
            type: actionTypes.PRODUCT_IN_SHELF_LIST,
            shelfList: json.data,
          })

          return json
        },
        (err) => {
          console.log(err)
        },
      )
  }
}

actions.product_clear_sku_list = (index) => {
  return {
    type: actionTypes.PRODUCT_SKU_LIST,
    list: [],
    index,
  }
}

// 获取分摊商品信息
actions.product_share_product = (id) => {
  return (dispatch) => {
    return Request('/stock/in_stock_sheet/material/search_share_sku')
      .data({ id })
      .get()
      .then((json) => {
        const shareProductMap = {}
        _.each(json.data, (s) => {
          if (_.has(shareProductMap, s.category_id_1)) {
            if (
              _.has(shareProductMap[s.category_id_1].children, s.category_id_2)
            ) {
              shareProductMap[s.category_id_1].children[
                s.category_id_2
              ].children.push({
                value: s.sku_id,
                name: s.name,
              })
            } else {
              shareProductMap[s.category_id_1].children[s.category_id_2] = {
                value: s.category_id_2,
                name: s.category_name_2,
                children: [
                  {
                    value: s.sku_id,
                    name: s.name,
                  },
                ],
              }
            }
          } else {
            const children1 = {}
            children1[s.category_id_2] = {
              value: s.category_id_2,
              name: s.category_name_2,
              children: [
                {
                  value: s.sku_id,
                  name: s.name,
                },
              ],
            }
            shareProductMap[s.category_id_1] = {
              value: s.category_id_1,
              name: s.category_name_1,
              children: children1,
            }
          }
        })

        const shareProduct = _.map(shareProductMap, (data) => {
          return {
            value: data.value,
            name: data.name,
            children: _.map(data.children, (c) => {
              return c
            }),
          }
        })

        dispatch({
          type: actionTypes.PRODUCT_SHARE_PRODUCT,
          shareProduct: shareProduct,
        })

        return json
      })
  }
}

actions.product_share_product_list = (shareProduct) => {
  return {
    type: actionTypes.PRODUCT_SHARE_PRODUCT,
    shareProduct,
  }
}

// 入库
actions.product_in_stock_add = (data) => {
  return () => {
    return Request('/stock/in_stock_sheet/material/create').data(data).post()
  }
}

actions.product_in_stock_detail = (id) => {
  // detail getDetail
  return (dispatch) => {
    return Request('/stock/in_stock_sheet/material/new_detail')
      .data({ id })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_IN_STOCK_DETAIL,
          list: json.data,
        })

        return json
      })
  }
}

actions.product_in_stock_detail_init = () => {
  return {
    type: actionTypes.PRODUCT_IN_STOCK_DETAIL_INIT,
  }
}

actions.product_in_order_remark_change = (value) => {
  return {
    type: actionTypes.PRODUCT_IN_ORDER_REMARK_CHANGE,
    value,
  }
}

actions.product_in_stock_batch_import = (sheetData) => {
  return {
    type: actionTypes.PRODUCT_IN_STOCK_BATCH_IMPORT,
    sheetData,
  }
}

actions.product_in_date_change = (submit_time) => {
  return {
    type: actionTypes.PRODUCT_IN_PRODUCT_DATE_CHANGE,
    submit_time,
  }
}

actions.product_in_pro_detail_add = () => {
  return {
    type: actionTypes.PRODUCT_IN_PRO_DETAIL_ADD,
  }
}

actions.product_in_pro_detail_del = (index) => {
  return {
    type: actionTypes.PRODUCT_IN_PRO_DETAIL_DEL,
    index,
  }
}

actions.product_in_product_name_selected = (index, selected, list) => {
  const shelf_id = selected ? selected.shelf_id : null
  return {
    type: actionTypes.PRODUCT_IN_PRODUCT_NAME_SELECTED,
    index,
    selected,
    shelf_ids: getShelfSelectedValueForCascade(list, shelf_id),
  }
}

actions.product_in_details_item_field_change = (index, value, field) => {
  return {
    type: actionTypes.PRODUCT_IN_DETAILS_ITEM_FIELD_CHANGE,
    index,
    field,
    value,
  }
}

actions.product_in_product_life_time_change = (index, time) => {
  return {
    type: actionTypes.PRODUCT_IN_PRODUCT_LIFE_TIME_CHANGE,
    index,
    time,
  }
}

actions.product_in_product_production_time_change = (index, time) => {
  return {
    type: actionTypes.PRODUCT_IN_PRODUCT_PRODUCTION_TIME_CHANGE,
    index,
    time,
  }
}

actions.product_in_product_shelf_change = (index, selectedValue) => {
  return {
    type: actionTypes.PRODUCT_IN_PRODUCT_SHELF_CHANGE,
    index,
    selectedValue,
  }
}

actions.product_in_share_add = (share) => {
  return {
    type: actionTypes.PRODUCT_IN_SHARE_ADD,
    share,
  }
}

actions.product_in_share_del = (index) => {
  return {
    type: actionTypes.PRODUCT_IN_SHARE_DEL,
    index,
  }
}

actions.product_in_discount_add = (discount) => {
  return {
    type: actionTypes.PRODUCT_IN_DISCOUNT_ADD,
    discount,
  }
}

actions.product_in_discount_del = (index) => {
  return {
    type: actionTypes.PRODUCT_IN_DISCOUNT_DEL,
    index,
  }
}

actions.product_in_stock_submit = (data) => {
  return () => {
    return Request('/stock/in_stock_sheet/material/modify').data(data).post()
  }
}

actions.product_in_stock_check_pass = (data) => {
  return () => {
    return Request('/stock/in_stock_sheet/material/review')
      .data(data)
      .code([5])
      .post()
  }
}

actions.product_in_stock_cancel = (id) => {
  return () => {
    return Request('/stock/in_stock_sheet/material/cancel').data({ id }).post()
  }
}

// 出库
actions.product_out_stock_list = (searchData) => {
  return (dispatch) => {
    return Request('/stock/out_stock_sheet/list')
      .data(searchData)
      .get()
      .then((json) => {
        var response = json.data
        dispatch({
          type: actionTypes.PRODUCT_OUT_STOCK_LIST,
          list: response && response.out_stock_list,
          in_query: response && response.in_query,
          in_query_search_text: searchData.search_text || '',
        })
        return json
      })
  }
}

actions.product_out_stock_filter_change = (name, value) => {
  // 更新 local 服务时间
  if (name === 'time_config_id') {
    DBActionStorage.set(ACTION_STORAGE_KEY_NAMES.PRODUCT_OUTSTOCK_TIME, value)
  }
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_FILTER_CHANGE,
    name,
    value,
  }
}

actions.product_out_stock_clear = () => {
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_CLEAR,
  }
}

actions.product_out_stock_id = (outStockId) => {
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_ID,
    outStockId,
  }
}

actions.product_out_stock_object = (outStockObject) => {
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_OBJECT,
    outStockObject,
  }
}

actions.product_out_stock_add = (out_stock_target) => {
  return () => {
    return Request('/stock/out_stock_sheet/create')
      .data(out_stock_target)
      .post()
  }
}

actions.product_out_stock_pro_detail_add = () => {
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_PRO_DETAIL_ADD,
  }
}

actions.product_out_stock_pro_detail_del = (index) => {
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_PRO_DETAIL_DEL,
    index,
  }
}

actions.product_out_stock_date_change = (date) => {
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_DATE_CHANGE,
    date,
  }
}

actions.product_out_stock_detail = (id) => {
  return (dispatch) => {
    return Request('/stock/out_stock_sheet/detail')
      .data({ id })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_OUT_STOCK_DETAIL,
          data: json.data,
        })
        return json
      })
  }
}

actions.product_out_product_name_selected = (index, selected) => {
  return {
    type: actionTypes.PRODUCT_OUT_PRODUCT_NAME_SELECTED,
    index,
    selected,
  }
}

actions.product_out_product_quantity_change = (index, quantity) => {
  return {
    type: actionTypes.PRODUCT_OUT_PRODUCT_QUANTITY_CHANGE,
    index,
    quantity,
  }
}

actions.product_out_product_batch_selected = (index, batch_details) => {
  return {
    type: actionTypes.PRODUCT_OUT_PRODUCT_BATCH_SELECTED,
    index,
    batch_details,
  }
}

actions.product_out_stock_batch_confirm = (data) => {
  return () => {
    return Request('/stock/out_stock_sheet/negative_stock_remind_batch')
      .data(data)
      .get()
  }
}

actions.product_out_stock_confirm = (data) => {
  return () => {
    return Request('/stock/out_stock_sheet/negative_stock_remind_single')
      .data(data)
      .post()
  }
}

actions.product_out_stock_submit = (data) => {
  return () => {
    return Request('/stock/out_stock_sheet/modify').data(data).code(-1).post()
  }
}

actions.product_out_stock_anomaly = (anomaly) => {
  return {
    type: actionTypes.PRODUCT_OUT_STOCK_ANOMALY,
    anomaly,
  }
}

actions.product_out_stock_cancel = (id) => {
  return () => {
    return Request('/stock/out_stock_sheet/cancel').data({ id }).post()
  }
}

actions.product_out_stock_get_service_time = () => {
  return (dispatch, getState) => {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const serviceTime = json.data
        const time_config_id = DBActionStorage.get(
          ACTION_STORAGE_KEY_NAMES.PRODUCT_OUTSTOCK_TIME,
        )
        const { initServiceTimeId } = DBActionStorage.helper
        const curId = getState().product.outStock.filter.time_config_id

        dispatch({
          type: actionTypes.PRODUCT_OUT_STOCK_SERVICE_TIME,
          serviceTime: json.data,
        })
        // 初始化运营时间
        initServiceTimeId(curId, time_config_id, serviceTime, (val) => {
          dispatch(
            actions.product_out_stock_filter_change('time_config_id', val),
          )
        })

        return json
      })
  }
}

actions.product_out_stock_confirm_batch = (data) => {
  return () => {
    return Request('/stock/out_stock_sheet/submit/batch').data(data).post()
  }
}

// 退货
actions.product_refund_list = (searchData) => {
  return (dispatch) => {
    return Request('/stock/return_stock_sheet/list')
      .data(searchData)
      .get()
      .then((json) => {
        var response = json.data
        dispatch({
          type: actionTypes.PRODUCT_REFUND_LIST,
          list: (response && response.return_stock_list) || [],
          in_query: response && response.in_query,
          in_query_search_text: searchData.search_text || '',
        })
        return json
      })
  }
}

actions.product_refund_stock_clear = () => {
  return {
    type: actionTypes.PRODUCT_REFUND_STOCK_CLEAR,
  }
}

actions.product_refund_stock_filter_change = (name, value) => {
  return {
    type: actionTypes.PRODUCT_REFUND_STOCK_FILTER_CHANGE,
    name,
    value,
  }
}

actions.product_refund_stock_add = (data) => {
  return () => {
    return Request('/stock/return_stock_sheet/create').data(data).post()
  }
}

actions.product_refund_detail = (id) => {
  return (dispatch) => {
    return Request('/stock/return_stock_sheet/detail')
      .data({ id })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_REFUND_DETAIL,
          refundStockDetail: json.data,
        })
        return json
      })
  }
}

actions.product_refund_stock_check_pass = (data) => {
  return () => {
    return Request('/stock/return_stock_sheet/review').data(data).post()
  }
}

actions.product_refund_stock_cancel = (id) => {
  return () => {
    return Request('/stock/return_stock_sheet/cancel').data({ id }).post()
  }
}

actions.product_refund_stock_batch_import = (sheetData) => {
  return {
    type: actionTypes.PRODUCT_REFUND_STOCK_BATCH_IMPORT,
    sheetData,
  }
}

actions.product_refund_stock_batch_import_submit = (postData) => {
  return () => {
    return Request('/stock/return_stock_sheet/import')
      .data({ return_stock_list: JSON.stringify(postData) })
      .code(1)
      .post()
  }
}

actions.product_stock_get_out_batch = (data) => {
  return () => {
    return Request('/stock/get_batch_out').data(data).get()
  }
}

actions.product_get_add_purchase_avg_price = (data) => {
  return () => {
    return Request('/purchase/purchase_spec/avg_price/get').data(data).get()
  }
}

actions.product_refund_product_batch_selected = (
  index,
  batch_number,
  selected_sum,
) => {
  return {
    type: actionTypes.PRODUCT_REFUND_PRODUCT_BATCH_SELECTED,
    index,
    batch_number,
    selected_sum,
  }
}

// 表格选择
actions.product_refund_product_list_selected_change = (selected) => {
  return {
    type: actionTypes.PRODUCT_REFUND_PRODUCT_LIST_SELECTED_CHANGE,
    selected,
  }
}

// 全选当前页/全部页
actions.product_refund_product_current_page_select_change = (isSelected) => {
  return {
    type: actionTypes.PRODUCT_REFUND_PRODUCT_CURRENT_PAGE_SELECT_CHANGE,
    isSelected,
  }
}

// 全选表格
actions.product_refund_product_table_all_select_change = (isSelected) => {
  return {
    type: actionTypes.PRODUCT_REFUND_PRODUCT_TABLE_ALL_SELECT_CHANGE,
    isSelected,
  }
}

// 清除table选择
actions.product_refund_product_clear_table_select = () => {
  return {
    type: actionTypes.PRODUCT_REFUND_PRODUCT_CLEAR_TABLE_SELECT,
  }
}

actions.product_refund_product_print_detail = (reqData) => {
  return (dispatch) => {
    return Request('/stock/return_stock_sheet/batch/print')
      .data(reqData)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_REFUND_PRODUCT_PRINT_DETAIL,
          refundPrintList: json.data,
        })
        return json
      })
  }
}

mapActions(actions)
