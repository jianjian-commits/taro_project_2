import { i18next } from 'gm-i18n'
import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import Big from 'big.js'

const actions = {}

// 获取搜索的选项
actions.get_search_option = () => {
  return (dispatch) => {
    return Request('/stock/refund/base')
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.GET_SEARCH_OPTION,
          data: json.data,
        })
      })
  }
}

let _data
// 获取搜索的结果
actions.get_search_result = (data) => {
  data ? (_data = data) : (data = _data)
  return (dispatch) => {
    return Request('/stock/refund/search')
      .data(data)
      .get()
      .then((json) => {
        _.forEach(json.data.refund_list, (refund) => {
          if (refund.in_stock_price) {
            refund.in_stock_price = Big(refund.in_stock_price)
              .div(100)
              .toFixed(2)
          } else if (refund.in_stock_price === 0) {
            refund.in_stock_price = 0
          } else {
            refund.in_stock_price = ''
          }

          // 净菜商品，应退数，前端换算成销售单位，实退数和入库数都是后台换算成销售单位
          refund.request_amount = refund.clean_food
            ? Big(refund.request_amount || 0)
                .div(refund.sale_ratio)
                .div(refund.std_ratio)
                .toFixed(2)
            : refund.request_amount

          refund.real_amount = refund.solution_id ? refund.real_amount : ''
          refund.store_amount = refund.solution_id ? refund.store_amount : ''

          // 用于编辑的中间变量
          refund.new_solution_id = refund.solution_id
          refund.new_real_amount = refund.real_amount
          refund.new_store_amount = refund.store_amount
          refund.new_in_stock_price = refund.in_stock_price
          refund.new_supplier_id = refund.supplier_id
          refund.new_supplier_name = refund.supplier_name
        })
        dispatch({
          type: actionTypes.GET_SEARCH_RESULT,
          data: json.data,
        })
        return json
      })
  }
}

actions.get_supply_list = (purchase_sku_id) => {
  return () => {
    return Request('/stock/settle_supplier/get').data({ purchase_sku_id }).get()
  }
}

actions.edit_refund = (refunds) => {
  return (dispatch) => {
    // 处理下价格
    refunds[0].in_stock_price = Big(refunds[0].in_stock_price)
      .mul(100)
      .toFixed(2)

    return Request('/stock/refund/edit')
      .data({
        refunds: JSON.stringify(refunds),
      })
      .post()
      .then(() => {
        Tip.success(i18next.t('编辑成功'))
        dispatch(actions.get_search_result())
      })
      .catch(() => {})
  }
}

actions.return_manage_selected = (list) => {
  return {
    type: actionTypes.RETURN_MANAGE_SELECTED,
    list,
  }
}

actions.recall_refund_receipt = (refund_id) => {
  return (dispatch) => {
    return Request('/stock/refund/cancel').data({ refund_id }).post()
  }
}

mapActions(actions)
