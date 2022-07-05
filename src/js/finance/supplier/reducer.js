import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action_types'
import _ from 'lodash'
import { formatLevelSelectData, treeToMap, getShelfSelected } from 'common/util'

const reducers = {}

const initState = {
  list: [],
  category1List: [],
  category2List: [],
  pinleiList: [],
  spuList: [],
  stations: [], // 当前站点下所有的总分总站点列表
  supplierInfo: {
    default_purchaser_id: '',
    customer_id: '',
    name: '',
    phone: '',
    company_name: '',
    company_address: '',
    merchandise: [],
    finance_manager: '',
    finance_manager_phone: '',
    bank: '',
    account_name: '',
    pay_method: 1,
    card_no: '',
    business_licence: '',
    user_id: '',
    is_active: 1,
    location_lon: null,
    location_lat: null,
    qualification_images: [],
    auto_apply_require_goods_sheet: 0,
    bill_type: 1,
    associate_station_id: -1, // 关联的站点ID
  },
  purchaseSpecList: [],
  // 货位信息
  shelfList: [],
  // 表格选择
  tableSelected: [],
  // 全选所有页
  isSelectAllPage: false,
  // 批量默认货位选择
  batchShelfSelected: [],
  purchaseSpecNum: 0,
  purchasers: [],
  purchaseSpecInfo: {
    category_1: '',
    category_2: '',
    pinglei: '',
    spu_id: '',
    price: 0,
    name: '',
    unit_name: '',
    ratio: 1,
  },
  supplierBatchImportList: [],
}

reducers.supplier = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.SUPPLIER_LIST:
      return Object.assign({}, state, { list: action.list })
    case actionTypes.SUPPLIER_CATEGORY1:
      return Object.assign({}, state, { category1List: action.category1List })
    case actionTypes.SUPPLIER_CATEGORY2:
      return Object.assign({}, state, { category2List: action.category2List })
    case actionTypes.SUPPLIER_PINLEI:
      return Object.assign({}, state, { pinleiList: action.pinleiList })
    case actionTypes.SUPPLIER_SPU:
      return Object.assign({}, state, { spuList: action.spuList })
    case actionTypes.SUPPLIER_INFO:
      return Object.assign({}, state, {
        supplierInfo: {
          ...action.supplierInfo,
          qualification_images: _.map(
            action.supplierInfo.qualification_images,
            (imgUrl) => ({
              key: imgUrl,
              id: imgUrl,
              name: imgUrl,
            })
          ),
        },
      })

    case actionTypes.SUPPLIER_CHANGE_INFO:
      return Object.assign({}, state, {
        supplierInfo: Object.assign({}, state.supplierInfo, {
          [action.name]: action.value,
        }),
      })
    case actionTypes.PURCHASE_SPECIFICATION_LIST: {
      const list = action.purchaseSpecList
      // 获取平铺的货位信息
      const spreadOutShelfList = treeToMap(state.shelfList)
      // 设置货位selected
      _.each(list, (item) => {
        item.shelf_selected = getShelfSelected(
          spreadOutShelfList,
          item.default_shelf_id
        )
      })

      return Object.assign({}, state, {
        purchaseSpecList: list,
        purchaseSpecNum: action.purchaseSpecNum,
      })
    }

    case actionTypes.PURCHASE_SPECIFICATION_INFO:
      return Object.assign({}, state, {
        purchaseSpecInfo: Object.assign({}, state.purchaseSpecInfo, {
          [action.name]: action.value,
        }),
      })
    case actionTypes.PURCHASER_LIST: {
      const data = _.map(action.purchasers, (item) => {
        return {
          ...item,
          value: item.id,
          text: item.name,
        }
      })

      return Object.assign({}, state, { purchasers: data })
    }

    case actionTypes.SUPPLIER_BATCH_IMPORT: {
      return Object.assign({}, state, {
        supplierBatchImportList: action.sheetData,
      })
    }

    case actionTypes.PURCHASE_SHELF_LIST: {
      // 添加不设置货位选项
      const shelfList = [
        {
          parent_id: null,
          value: 0,
          text: '不设置货位',
        },
      ].concat(formatLevelSelectData(action.shelfData))

      return Object.assign({}, state, {
        shelfList,
      })
    }

    case actionTypes.PURCHASE_TABLE_SELECT: {
      return Object.assign({}, state, { tableSelected: action.tableSelected })
    }

    // 改变表格全选，改变tableSelected
    case actionTypes.PURCHASE_TABLE_ALL_SELECT: {
      const changeData = {}
      if (action.isSelectAll) {
        changeData.tableSelected = _.map(state.purchaseSpecList, (v) => v.id)
      } else {
        changeData.tableSelected = []
      }

      return Object.assign({}, state, { ...changeData })
    }

    case actionTypes.PURCHASE_TABLE_ALL_PAGE_SELECT: {
      return Object.assign({}, state, {
        isSelectAllPage: action.isSelectAllPage,
      })
    }

    case actionTypes.SUPPLIER_PICS: {
      const { data } = action
      const qualification_images = state.supplierInfo.qualification_images.filter(
        (item) => data.includes(item.name)
      )
      const supplierInfo = Object.assign({}, state.supplierInfo, {
        qualification_images,
      })
      return Object.assign({}, state, { supplierInfo })
    }

    case actionTypes.SUPPLIER_STATIONS: {
      const data = _.map(action.list, (item) => {
        return {
          ...item,
          disabled: !!item.supplier_id && item.supplier_id !== action.supplier_id,
          value: item.station_id,
          text: item.station_name,
        }
      })

      return Object.assign({}, state, { stations: data })
    }

    default:
      return state
  }
}

mapReducers(reducers)
