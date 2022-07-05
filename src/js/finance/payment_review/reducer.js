import { i18next } from 'gm-i18n'
import { mapReducers } from 'redux-async-actions-reducers'
import actionTypes from './action_types'
import ACTION_STORAGE_KEY_NAMES from '../../common/action_storage_key_names'
import { mapActionStorage } from 'gm-service/src/action_storage'
import _ from 'lodash'
let reducers = {}

let initState = {
  tabKey: 0,
  timeTypeMap: {
    '1': i18next.t('按入库/退货'),
    '2': i18next.t('按建单日期'),
  },
  time_type: '2',
  receipt_type: '5',
  unhandle_type: '5',
  supplyGroup: [],
  selectSupplier: {
    value: '',
    name: '',
  },
  begin: new Date(),
  end: new Date(),
  unhandleSheet: [],
  usShowNum: 7,
  usSelected: [],
  settleSheet: [],
  settleSheetShow: {},
  ssShowNum: 7,
  settle_sheet_detail: {
    sub_sheets: [],
    discount: [],
  },
  print_settle_sheet_detail: {
    sub_sheets: [],
    discount: [],
  },
}

reducers.payment_review = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.PAYMENT_REVIEW_TAB_KEY:
      return Object.assign({}, state, { tabKey: action.tabKey })
    case actionTypes.PAYMENT_REVIEW_SUPPLY_GROUP: {
      let sGMapping = _.map(action.supplyGroup, (sg) => {
        return {
          label: sg.name,
          children: _.map(sg.settle_suppliers, (ss) => {
            return {
              value: ss._id,
              name: ss.name,
            }
          }),
        }
      })

      return Object.assign({}, state, { supplyGroup: sGMapping })
    }
    case actionTypes.PAYMENT_REVIEW_SELECT_SUPPLIER:
      return Object.assign({}, state, { selectSupplier: action.selectSupplier })
    case actionTypes.PAYMENT_REVIEW_SEARCH_TIME:
      return Object.assign({}, state, { begin: action.begin, end: action.end })
    case actionTypes.PAYMENT_REVIEW_UNHANDLE_SHEET:
      return Object.assign({}, state, { unhandleSheet: action.unhandleSheet })
    case actionTypes.PAYMENT_REVIEW_UNHANDLE_SHEET_SHOW_NUM:
      return Object.assign({}, state, { usShowNum: action.usShowNum })
    case actionTypes.PAYMENT_REVIEW_UNHANDLE_SHEET_SELECTED:
      return Object.assign({}, state, { usSelected: action.usSelected })
    case actionTypes.PAYMENT_REVIEW_SETTLE_SHEET:
      return Object.assign({}, state, { settleSheet: action.settleSheet })
    case actionTypes.PAYMENT_REVIEW_SETTLE_SHEET_SHOW:
      return Object.assign({}, state, {
        settleSheetShow: action.settleSheetShow,
      })
    case actionTypes.PAYMENT_REVIEW_SETTLE_SHEET_SHOW_NUM:
      return Object.assign({}, state, { ssShowNum: action.ssShowNum })
    case actionTypes.PAYMENT_REVIEW_CHANGE_TIME_TYPE:
      return Object.assign({}, state, { time_type: action.time_type })
    case actionTypes.PAYMENT_REVIEW_CHANGE_RECEIPT_TYPE:
      return Object.assign({}, state, { [action.name]: action.val })
    case actionTypes.PAYMENT_REVIEW_SETTLE_SHEET_DETAIL: {
      return Object.assign({}, state, { settle_sheet_detail: action.list })
    }
    case actionTypes.PAYMENT_REVIEW_PRINT_SETTLE_SHEET_DETAIL: {
      return Object.assign({}, state, {
        print_settle_sheet_detail: action.list,
      })
    }
    case actionTypes.PAYMENT_REVIEW_CHANGE_REMARK: {
      return Object.assign({}, state, {
        settle_sheet_detail: Object.assign({}, state.settle_sheet_detail, {
          remark: action.remark,
        }),
      })
    }
    case actionTypes.PAYMENT_REVIEW_DISCOUNT_ADD: {
      const discount = [...state.settle_sheet_detail.discount]

      // 如果只有一个空行
      if (discount.length === 1 && _.keys(discount[0]).length === 0) {
        discount[0] = action.discount
      } else {
        discount.push(action.discount)
      }

      return Object.assign({}, state, {
        settle_sheet_detail: Object.assign({}, state.settle_sheet_detail, {
          discount,
        }),
      })
    }
    case actionTypes.PAYMENT_REVIEW_DISCOUNT_DEL: {
      const discount = [...state.settle_sheet_detail.discount]
      discount.splice(action.index, 1)
      return Object.assign({}, state, {
        settle_sheet_detail: Object.assign({}, state.settle_sheet_detail, {
          discount,
        }),
      })
    }
    default:
      return state
  }
}
let storageOptions = {}
storageOptions.payment_review = {
  selector: ['time_type'],
  name: ACTION_STORAGE_KEY_NAMES.FINANCE_PAYMENT_REVIEW,
}

mapActionStorage(reducers, storageOptions)
mapReducers(reducers)
