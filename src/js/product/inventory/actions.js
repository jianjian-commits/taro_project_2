import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { Request } from '@gm-common/request'
import { DBActionStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'
import _ from 'lodash'
import moment from 'moment'

const actions = {}

actions.product_inventory_sku_categories = () => {
  return (dispatch) => {
    return Request('/station/skucategories')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_SKU_CATEGORIES,
          skuCategories: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_tab_key = (tabKey) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_TAB_KEY,
    inventoryTabKey: tabKey,
  }
}

actions.product_inventory_tab_to_batch = (key) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_TAB_TO_BATCH,
    inventoryTabKey: key,
  }
}

actions.product_inventory_record_tab_key = (tabKey) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_RECORD_TAB_KEY,
    inventoryRecordTabKey: tabKey,
  }
}

actions.out_stock_filter_change = (value, name) => {
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

actions.out_stock_filter_reset = () => ({
  type: actionTypes.PRODUCT_OUT_STOCK_FILTER_RESET,
})

actions.product_inventory_product_management_list = (data) => {
  return (dispatch) => {
    return Request('/stock/list')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_PRODUCT_MANAGEMENT_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_product_management_sum = (data) => {
  return (dispatch) => {
    return Request('/stock/remain_value/sum')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_PRODUCT_MANAGEMENT_SUM,
          data: json.data,
        })
      })
  }
}

actions.product_inventory_in_stock_list = (data) => {
  return (dispatch) => {
    return Request('/stock/in_stock_sku')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_IN_STOCK_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_out_stock_list = (data) => {
  return (dispatch) => {
    return Request('/stock/out_stock_sku')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_OUT_STOCK_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_refund_stock_list = (data) => {
  return (dispatch) => {
    return Request('/stock/return_supply_sku')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_REFUND_STOCK_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_loss_stock_list = (data) => {
  return (dispatch) => {
    return Request('/stock/loss')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_LOSS_STOCK_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_increase_stock_list = (data) => {
  return (dispatch) => {
    return Request('/stock/increase')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_INCREASE_STOCK_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_return_stock_list = (data) => {
  return (dispatch) => {
    return Request('/stock/refund_stock_sku')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_RETURN_STOCK_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_batch_import = (file, clean_food) => {
  return (dispatch) => {
    return Request('/stock/check/upload', { timeout: 50000 })
      .data({ file, clean_food })
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_BATCH_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_batch_list_modify = (data) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_BATCH_LIST,
    list: data,
  }
}

actions.product_inventory_batch_select = (selected) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_BATCH_SELECT,
    selected,
  }
}

actions.product_inventory_batch_save = (data) => {
  return () => {
    return Request('/stock/check/batch', { timeout: 50000 }).data(data).post()
  }
}

actions.product_inventory_stock_edit = (data) => {
  return () => {
    return Request('/stock/edit').data(data).post()
  }
}

actions.product_inventory_batch_cache = (list = []) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_BATCH_CACHE,
    list,
  }
}

actions.product_inventory_batch_management_list = (data) => {
  return (dispatch) => {
    return Request('/stock/check/batch_number')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_BATCH_MANAGEMENT_LIST,
          list: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_batch_management_stock_edit = (data) => {
  return () => {
    return Request('/stock/check/batch_edit').data(data).post()
  }
}

actions.product_inventory_batch_edit_status = (data) => {
  return () => {
    return Request('/stock/batch/edit_status').data(data).post()
  }
}

actions.product_inventory_shelf_management_list = (data) => {
  if (data && data.export === 1) {
    return () => {
      return Request('/stock/check/shelf').data(data).get()
    }
  } else {
    return (dispatch) => {
      return Request('/stock/check/shelf')
        .data(data)
        .get()
        .then((json) => {
          dispatch({
            type: actionTypes.PRODUCT_INVENTORY_SHELF_MANAGEMENT_LIST,
            list: json.data,
          })
          return json
        })
    }
  }
}

actions.product_inventory_shelf_management_expand = (index) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_SHELF_MANAGEMENT_EXPAND,
    index,
  }
}

actions.product_inventory_get_change_record = (data) => {
  return (dispatch) => {
    return Request('/stock/check/batch_log')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_CHANGE_RECORD_LIST,
          changeRecord: json.data,
        })
        return json
      })
  }
}

actions.product_inventory_update_avg_price = (data) => {
  // 修复库存均价
  return () => {
    return Request('/stock/avg_price/update')
      .data({ goods_infos: JSON.stringify(data) })
      .post()
  }
}

actions.product_inventory_update_out_stock_price = (data) => {
  // 修复出库成本价
  return () => {
    return Request('/stock/out_stock_price/update')
      .data({ goods_infos: JSON.stringify(data) })
      .post()
  }
}

actions.product_inventory_supplement_list = (data) => {
  return (dispatch, getState) => {
    return Request('/purchase/task/supplement_list')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_SUPPLEMENT_LIST,
          supplementList: _.map(json.data, (v) => {
            // 默认采购规格 id
            let settle_supplier

            const purchase_spec =
              _.find(
                v.purchase_data,
                ({ spec_id }) => spec_id === v.default_purchase_spec,
              ) ||
              v.purchase_data[0] ||
              {}
            // 默认供应商

            const settle_suppliers_all = [
              ...(purchase_spec?.settle_suppliers?.other_supplier ?? []),
              ...(purchase_spec?.settle_suppliers?.target_supplier ?? []),
            ]
            if (settle_suppliers_all.length > 0) {
              settle_supplier =
                _.find(
                  settle_suppliers_all,
                  ({ id }) => id === v.default_supplier_id,
                ) ||
                settle_suppliers_all[0] ||
                {}
            }
            // FIXME https://www.tapd.cn/my_worktable?source_user=181902850&workspace_id=23671581&workitem_type=bug&workitem_id=1123671581001024769#&filter_close=true
            // 默认采购数量
            const purchase_num = v.default_purchase_num || 0
            return {
              ...v,
              isRelatePeriod: false, // 是否关联周期
              purchase_spec,
              settle_supplier,
              purchase_num,
              service_time: getState().inventory.serviceTimes[0],
              cycle_start_time: moment(),
            }
          }),
        })
        return json
      })
  }
}

actions.product_inventory_create_purchase = (data) => {
  return () => {
    return Request('/purchase/task/batch_create')
      .data({ purchase_task: JSON.stringify(data) })
      .post()
  }
}

actions.product_inventory_update_supplement_list = (data) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_SUPPLEMENT_LIST,
    supplementList: data,
  }
}

actions.product_inventory_get_service_time = () => {
  return (dispatch) => {
    return Request('/service_time/list')
      .get()
      .then((json) => {
        const { data } = json
        dispatch(actions.out_stock_filter_change(data[0]._id, 'time_config_id'))

        dispatch({
          type: actionTypes.PRODUCT_INVENTORY_SERVICE_TIME,
          serviceTimes: json.data || [],
        })
        return json
      })
  }
}

actions.product_inventory_batch_filter_change = (batchFilter) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.PRODUCT_INVENTORY_BATCH_FILTER_CHANGE,
      batchFilter,
    })
  }
}

actions.product_inventory_select_product = (checked, spuId) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_SELECT_PRODUCT,
    checked,
    spuId,
  }
}

actions.product_inventory_select_all_product = (checked) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_SELECT_ALL_PRODUCT,
    checked,
  }
}

actions.product_inventory_select_all_type_product = (selectAllType) => {
  return {
    type: actionTypes.PRODUCT_INVENTORY_SELECT_ALL_TYPE_PRODUCT,
    selectAllType,
  }
}

// 获取导出数据
actions.product_inventory_batch_list_export = (data) => {
  return () => {
    return Request('/stock/check/batch_number/export').data(data).get()
  }
}

mapActions(actions)
