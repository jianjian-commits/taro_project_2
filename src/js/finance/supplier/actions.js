import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action_types.js'
import { Request } from '@gm-common/request'
import _ from 'lodash'

const actions = {}

actions.supplier_get_list = (data) => {
  return (dispatch) => {
    return Request('/supplier/search')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SUPPLIER_LIST,
          list: json.data,
        })

        return json
      })
  }
}

actions.supplier_get_category1 = () => {
  return (dispatch) => {
    return Request('/merchandise/category1/get')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SUPPLIER_CATEGORY1,
          category1List: json.data,
        })
        return json.data
      })
  }
}

actions.supplier_get_category2 = () => {
  return (dispatch) => {
    return Request('/merchandise/category2/get')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SUPPLIER_CATEGORY2,
          category2List: json.data,
        })
        return json.data
      })
  }
}

actions.supplier_get_pinlei = () => {
  return (dispatch) => {
    return Request('/merchandise/pinlei/get')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SUPPLIER_PINLEI,
          pinleiList: json.data,
        })
        return json.data
      })
  }
}

actions.supplier_get_spu = (data) => {
  return (dispatch) => {
    return Request('/merchandise/spu/list')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SUPPLIER_SPU,
          spuList: json.data,
        })
        return json.data
      })
  }
}

actions.supplier_change_info = (name, value) => {
  console.log(name, value)
  return {
    type: actionTypes.SUPPLIER_CHANGE_INFO,
    name,
    value,
  }
}

actions.get_purchasers = (supplier_id = '') => {
  return (dispatch) => {
    return Request('/purchase/purchaser/search')
      .data({ search_text: supplier_id, offset: 0, limit: 100 })
      .get()
      .then((json) => {
        const purchasers = _.filter(json.data, (item) => {
          return item.status
        })
        dispatch({
          type: actionTypes.PURCHASER_LIST,
          purchasers,
        })
        return json
      })
  }
}

actions.supplier_create = (data) => {
  return () => {
    return Request('/supplier/create').data(data).post()
  }
}

actions.supplier_get_detail = (data) => {
  return (dispatch) => {
    return Request('/supplier/detail')
      .data(data)
      .get()
      .then((json) => {
        if (json.data.user_id === null) json.data.user_id = ''
        dispatch({
          type: actionTypes.SUPPLIER_INFO,
          supplierInfo: json.data,
        })
        return json.data
      })
  }
}

actions.supplier_clear_supplier_info = () => {
  return {
    type: actionTypes.SUPPLIER_INFO,
    supplierInfo: {
      customer_id: '',
      name: '',
      phone: '',
      company_name: '',
      company_address: '',
      merchandise: [],
      finance_manager: '',
      finance_manager_phone: '',
      bank: '',
      pay_method: 1,
      card_no: '',
      business_licence: '',
      user_id: '',
      is_active: 1,
      auto_apply_require_goods_sheet: false, // 采购单据自动同步
    },
  }
}

actions.supplier_update = (data) => {
  return () => {
    return Request('/supplier/update').data(data).post()
  }
}

actions.supplier_delete = (data) => {
  return () => {
    return Request('/supplier/delete').data(data).post()
  }
}

actions.supplier_get_purchase_specification_list = (data) => {
  return (dispatch) => {
    return Request('/purchase_spec/search')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_SPECIFICATION_LIST,
          purchaseSpecList: json.data.purchase_spec,
          purchaseSpecNum: json.data.pur_spec_num,
        })
        return json.data
      })
  }
}
actions.supplier_export_purchase_specification_list = (data) => {
  return (dispatch) => {
    return Request('/purchase_spec/export').data(data).get()
  }
}

actions.supplier_delete_purchase_specification = (data) => {
  return () => {
    return Request('/purchase_spec/delete').data(data).post()
  }
}

actions.supplier_change_purchase_specification_info = (name, value) => {
  return {
    type: actionTypes.PURCHASE_SPECIFICATION_INFO,
    name,
    value,
  }
}

actions.supplier_purchase_specification_create = (data) => {
  return () => {
    return Request('/purchase_spec/create').data(data).post()
  }
}

actions.supplier_purchase_specification_update = (data) => {
  return () => {
    return Request('/purchase_spec/update').data(data).post()
  }
}

actions.supplier_account_reset_pwd = (data) => {
  return () => {
    return Request('/supplier/reset_pwd').data(data).post()
  }
}

actions.supplier_account_save = (data) => {
  return () => {
    return Request('/supplier/account').data(data).post()
  }
}

actions.supplier_export = (data) => {
  return () => {
    return Request('/supplier/export').data(data).get()
  }
}

actions.get_import_template = (data) => {
  return () => Request('/purchase_spec/search').data(data).get()
}

actions.get_supplier_account_and_username = () => {
  return () => {
    return Request('/supplier/account')
      .data()
      .get()
      .then((json) => {
        const result = _.map(json.data, (item) => {
          if (item.supplier) {
            item.username = `${item.username}（${item.supplier}）`
          }
          return item
        })
        return result
      })
  }
}

actions.supplier_batch_import = (sheetData) => {
  return {
    type: actionTypes.SUPPLIER_BATCH_IMPORT,
    sheetData,
  }
}

// 获取货位信息
actions.purchase_shelf_list = () => {
  return (dispatch) => {
    return Request('/stock/shelf/tree')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PURCHASE_SHELF_LIST,
          shelfData: json.data,
        })

        return json
      })
  }
}

// 表格选择
actions.purchase_table_select = (selected) => {
  return {
    type: actionTypes.PURCHASE_TABLE_SELECT,
    tableSelected: selected,
  }
}

// 表格全选
actions.purchase_table_all_select = (isSelectAll) => {
  return {
    type: actionTypes.PURCHASE_TABLE_ALL_SELECT,
    isSelectAll,
  }
}

// 全选所有页
actions.purchase_table_all_page_select = (isSelectAllPage) => {
  return {
    type: actionTypes.PURCHASE_TABLE_ALL_PAGE_SELECT,
    isSelectAllPage,
  }
}

// 批量设置默认货位
actions.purchase_set_batch_default_shelf = (reqData) => {
  return () =>
    Request('/purchase_spec/batch/set_default_shelf').data(reqData).post()
}

actions.supplier_pics = (data) => {
  return {
    type: actionTypes.SUPPLIER_PICS,
    data,
  }
}

actions.supplier_stations = (supplier_id) => {
  return (dispatch) => {
    return Request('/supplier/stations')
      .data()
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.SUPPLIER_STATIONS,
          list: json.data,
          supplier_id,
        })
        return json.data
      })
  }
}

mapActions(actions)
