import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action_types.js'
import { Request } from '@gm-common/request'

const actions = {}

actions.payment_review_tab_key = (tabKey) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_TAB_KEY,
    tabKey,
  }
}

actions.payment_review_supply_group = () => {
  return (dispatch) => {
    return Request('/stock/settle_supplier/get')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PAYMENT_REVIEW_SUPPLY_GROUP,
          supplyGroup: json.data,
        })
        return json
      })
  }
}

actions.payment_review_select_supplier = (selectSupplier) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_SELECT_SUPPLIER,
    selectSupplier,
  }
}

actions.payment_review_search_time = (begin, end) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_SEARCH_TIME,
    begin,
    end,
  }
}

actions.payment_review_unhandle_sheet = (data) => {
  return (dispatch) => {
    return Request('/stock/settle_sheet/unsettled')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PAYMENT_REVIEW_UNHANDLE_SHEET,
          unhandleSheet: json.data,
        })
        return json
      })
  }
}

actions.payment_review_settle_sheet = (data) => {
  return (dispatch) => {
    return Request('/stock/settle_sheet')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PAYMENT_REVIEW_SETTLE_SHEET,
          settleSheet: json.data,
        })
        return json
      })
  }
}

actions.payment_review_unhandle_sheet_show_num = (usShowNum) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_UNHANDLE_SHEET_SHOW_NUM,
    usShowNum,
  }
}

actions.payment_review_settle_sheet_show_num = (ssShowNum) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_SETTLE_SHEET_SHOW_NUM,
    ssShowNum,
  }
}

actions.payment_review_unhandle_sheet_selected = (usSelected) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_UNHANDLE_SHEET_SELECTED,
    usSelected,
  }
}

actions.payment_review_settle_sheet_show = (settleSheetShow) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_SETTLE_SHEET_SHOW,
    settleSheetShow,
  }
}

actions.payment_review_change_time_type = (time_type) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_CHANGE_TIME_TYPE,
    time_type,
  }
}

actions.payment_review_change_receipt_type = (val, name) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_CHANGE_RECEIPT_TYPE,
    val,
    name,
  }
}

actions.payment_review_add_settle_sheet = (data) => {
  return () => {
    return Request('/stock/settle_sheet').data(data).post()
  }
}

// 获取单据详情
actions.payment_review_settle_sheet_detail = (id) => {
  return (dispatch) => {
    return Request('/stock/settle_sheet/details')
      .data({ id })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PAYMENT_REVIEW_SETTLE_SHEET_DETAIL,
          list: json.data,
        })
        return json
      })
  }
}

actions.payment_review_discount_add = (discount) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_DISCOUNT_ADD,
    discount,
  }
}

actions.payment_review_discount_del = (index) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_DISCOUNT_DEL,
    index,
  }
}

actions.payment_review_change_remark = (remark) => {
  return {
    type: actionTypes.PAYMENT_REVIEW_CHANGE_REMARK,
    remark,
  }
}

// 提交结款单
actions.payment_review_modify_settle_sheet = (data) => {
  return () => {
    return Request('/stock/settle_sheet/submit').data(data).post()
  }
}

// 审核不通过
actions.payment_review_reject_settle_sheet = (data) => {
  return () => {
    return Request('/stock/settle_sheet/reject').data(data).post()
  }
}

actions.payment_review_del_settle_sheet = (data) => {
  return () => {
    return Request('/stock/settle_sheet/delete').data(data).post()
  }
}

actions.payment_review_cancel_settle_sheet_pay = (data) => {
  return () => {
    return Request('/stock/settle_sheet/pay').data(data).post()
  }
}

actions.payment_review_mark_settle_sheet = ({
  id,
  money,
  payNumber,
  amount,
  payRemark,
}) => {
  return () => {
    return Request('/stock/settle_sheet/pay')
      .data({
        batch: 0,
        ids: JSON.stringify([id]),
        running_number: payNumber,
        amount,
        op: 'pay',
        pay_remark: payRemark,
      })
      .post()
  }
}

actions.payment_review_print_settle_sheet_detail = (sheet_no) => {
  return (dispatch) => {
    return Request('/stock/settle_sheet/deal')
      .data({ sheet_no })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PAYMENT_REVIEW_PRINT_SETTLE_SHEET_DETAIL,
          list: json.data,
        })
        return json
      })
  }
}

mapActions(actions)
