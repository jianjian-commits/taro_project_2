import { i18next } from 'gm-i18n'
import React from 'react'
import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'
import moment from 'moment'
import { Tip, Dialog } from '@gmfe/react'
import { Request } from '@gm-common/request'
import { Id2UniverseId } from './filter'
import { System } from '../../../common/service'

const debounce = _.debounce((func) => {
  return func()
}, 800)

const actions = {}

actions.price_rule_tab_change = (tab) => {
  return {
    type: actionTypes.PRICE_RULE_TAB_CHANGE,
    tab,
  }
}

/** 已迁移 */
// actions.price_rule_tab1_filter_change = option => {
//   return {
//     type: actionTypes.PRICE_RULE_TAB1_FILTER_CHANGE,
//     option
//   }
// }

/** 已迁移 */
// actions.price_rule_tab2_filter_change = option => {
//   return {
//     type: actionTypes.PRICE_RULE_TAB2_FILTER_CHANGE,
//     option
//   }
// }

actions.price_rule_clear = () => {
  return {
    type: actionTypes.PRICE_RULE_CLEAR,
  }
}

/** 迁移 */
// actions.price_rule_edit_change = index => {
//   return {
//     type: actionTypes.PRICE_RULE_EDIT_CHANGE,
//     index
//   }
// }

/** 似乎没用到 */
actions.price_rule_edit_data_change = (index, begin, end, status) => {
  return {
    type: actionTypes.PRICE_RULE_EDIT_DATA_CHANGE,
    index,
    begin,
    end,
    status,
  }
}

actions.price_rule_creater_show = () => {
  return {
    type: actionTypes.PRICE_RULE_CREATER_SHOW,
  }
}

actions.price_rule_creater_hide = () => {
  return {
    type: actionTypes.PRICE_RULE_CREATER_HIDE,
  }
}

actions.price_rule_pre_create = (data) => {
  return {
    type: actionTypes.PRICE_RULE_PRE_CREATE,
    data: data,
  }
}

actions.price_rule_sheet_price_change = (index, yx_price) => {
  return {
    type: actionTypes.PRICE_RULE_SHEET_PRICE_CHANGE,
    yx_price,
    index,
  }
}

actions.price_rule_sheet_rule_and_price_change = (index, modifyObj) => {
  return {
    type: actionTypes.PRICE_RULE_SHEET_RULE_AND_PRICE_CHANGE,
    index,
    modifyObj,
  }
}

/** 已迁移 */
// actions.price_rule_search_by_rule = (
//   pagination,
//   status = 3,
//   keyword = '',
//   station_id
// ) => {
//   return dispatch => {
//     const reg_priceRule = /^xssj\d+$/i
//     const reg_salemenuID = /^s\d+$/i
//     let price_rule_no = ''
//     let salemenu_id = ''
//     let salemenu_name = ''
//     // 正则表达式判断输入数据的类型
//     if (reg_salemenuID.test(keyword)) {
//       salemenu_id = keyword
//     } else if (reg_priceRule.test(keyword)) {
//       price_rule_no = keyword
//     } else {
//       salemenu_name = keyword
//     }

//     dispatch({
//       type: actionTypes.PRICE_RULE_SEARCH_BY_RULE_LOADDING_TOGGLE
//     })

//     return Request('/station/price_rule/search')
//       .data({
//         price_rule_id: price_rule_no,
//         salemenu_id: salemenu_id,
//         salemenu_name: salemenu_name,
//         station_id: station_id || '',
//         status: status === '-1' ? '' : status,
//         cur_page: pagination.offset / pagination.limit || 0,
//         cnt_per_page: pagination.limit || 10
//       })
//       .get()
//       .then(json => {
//         dispatch({
//           type: actionTypes.PRICE_RULE_SEARCH_BY_RULE_GOT,
//           data: json.data
//         })
//       })
//       .catch(() => {
//         dispatch({
//           type: actionTypes.PRICE_RULE_SEARCH_BY_RULE_LOADDING_TOGGLE
//         })
//       })
//   }
// }

/** 已迁移 */
// actions.price_rule_search_by_sku = (
//   pagination,
//   ruleTarget,
//   status,
//   keyword1,
//   keyword2,
//   station_id
// ) => {
//   return dispatch => {
//     dispatch({
//       type: actionTypes.PRICE_RULE_SEARCH_BY_SKU_LOADDING_TOGGLE
//     })

//     return Request('/station/price_rule/sku_search', { timeout: 15000 })
//       .data({
//         address_text: keyword1,
//         sku_text: keyword2,
//         station_id: station_id || '',
//         status: status === '-1' ? '' : status,
//         cur_page: pagination.offset / pagination.limit || 0,
//         cnt_per_page: pagination.limit || 10,
//         type: ruleTarget
//       })
//       .get()
//       .then(json => {
//         dispatch({
//           type: actionTypes.PRICE_RULE_SEARCH_BY_SKU_GOT,
//           data: json.data
//         })
//       })
//       .catch(() => {
//         dispatch({
//           type: actionTypes.PRICE_RULE_SEARCH_BY_SKU_LOADDING_TOGGLE
//         })
//       })
//   }
// }

/** 已迁移 */
// actions.price_rule_skuview_ruletype_change = targetType => {
//   return {
//     type: actionTypes.PRICE_RULE_SKUVIEW_RULETYPE_CHANGE,
//     targetType
//   }
// }

// exclude_toC: 过滤零售的报价单
actions.price_rule_get_salemenus = () => {
  return (dispatch) => {
    return Request('/station/salemenu/')
      .data({ json: 1, exclude_toC: 1 })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRICE_RULE_SALEMENUS_GET,
          data: json.data,
        })
      })
  }
}

actions.price_rule_get_stations = () => {
  return (dispatch) => {
    return Request('/station/stations/')
      .data({ roles: '0,2' })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRICE_RULE_STATIONS_GET,
          data: json.data,
        })
      })
  }
}

actions.price_rule_detail_get = (price_rule_id, viewType) => {
  return (dispatch) => {
    return Request('/station/price_rule/edit')
      .data({ price_rule_id })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.PRICE_RULE_DETAIL_GET,
          data: json.data,
          viewType,
        })
      })
  }
}

actions.price_rule_detail_clear = () => {
  return {
    type: actionTypes.PRICE_RULE_DETAIL_CLEAR,
  }
}

actions.price_rule_upload = (postData) => {
  return (dispatch) => {
    return Request('/station/price_rule/upload/')
      .data(postData)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.PRICE_RULE_UPLOAD,
          data: json.data,
          upload_type: postData.upload_type,
        })
      })
  }
}

actions.price_rule_upload_clear = () => {
  return {
    type: actionTypes.PRICE_RULE_UPLOAD_CLEAR,
  }
}

actions.price_rule_detail_upload_sku_change = (options, index) => {
  return {
    type: actionTypes.PRICE_RULE_DETAIL_UPLOAD_SKU_CHANGE,
    options,
    index,
  }
}

actions.price_rule_detail_upload_sku_select = (index, selected) => {
  return {
    type: actionTypes.PRICE_RULE_DETAIL_UPLOAD_SKU_SELECT,
    selected,
    index,
  }
}

actions.price_rule_detail_upload_sku_del = (index) => {
  return {
    type: actionTypes.PRICE_RULE_DETAIL_UPLOAD_SKU_DEL,
    index,
  }
}

actions.price_rule_update_detail_list = (list, listType) => {
  return {
    type: actionTypes.PRICE_RULE_UPDATE_DETAIL_LIST,
    list,
    listType,
  }
}

const conflictAlert = (json) => {
  const keys = _.keys(json.data)
  const data = json.data[keys[0]]

  const isSku = !!data.skus

  data.addresses = data.addresses.map((id) => Id2UniverseId(id))
  const ruleObject = isSku
    ? data.skus.join(',')
    : data.category_2_list.join(',')

  const children = (
    <div>
      <div className='b-word-break'>
        <strong>{i18next.t('站点/商户')}：</strong> {data.addresses.join(',')}
      </div>
      <div className='b-word-break'>
        <strong>{isSku ? i18next.t('商品ID') : i18next.t('分类ID')}：</strong>
        {ruleObject}
      </div>
      <div>
        <strong>{i18next.t('冲突日期')}：</strong>
        {moment(data.begin).format('YYYY-MM-DD')}
        {i18next.t('至')}
        {moment(data.end).format('YYYY-MM-DD')}
      </div>
    </div>
  )

  Dialog.alert({
    title: i18next.t('KEY120', {
      VAR1: keys[0],
    }) /* src:'与已有规则' + keys[0] + '冲突' => tpl:与已有规则${VAR1}冲突 */,
    children: children,
    size: 'md',
  })
}

/** 迁移 */
// /**
//  * 修改锁价规则。2种修改, 一种是在列表页,一种是在详情页
//  * @param postData
//  * @param index 传人index,表示为列表页的修改
//  * @returns {function()}
//  */
// actions.price_rule_detail_edit_save = (postData, index) => {
//   return dispatch => {
//     return Request('/station/price_rule/edit')
//       .code([0, 1, 10])
//       .data(postData)
//       .post()
//       .then(json => {
//         // 存在冲突
//         if (json.code === 10) {
//           conflictAlert(json)
//         } else if (json.code === 0) {
//           Tip.success(i18next.t('修改成功'))

//           if (index !== undefined) {
//             dispatch({
//               type: actionTypes.PRICE_RULE_EDIT_SAVE,
//               index
//             })
//           }
//         } else {
//           Tip.danger(json.msg)
//         }

//         return json
//       })
//   }
// }

/**
 * 创建锁价规则
 * @param postData
 * @returns {function()}
 */
actions.price_rule_create = (postData) => {
  return () => {
    return Request('/station/price_rule/create')
      .code([0, 1, 10])
      .data(postData)
      .post()
      .then((json) => {
        // 存在冲突
        if (json.code === 10) {
          conflictAlert(json)
        } else if (json.code === 0) {
          Tip.success(
            i18next.t('KEY122', {
              VAR1: json.data,
            }) /* src:`锁价规则${json.data}创建成功` => tpl:锁价规则${VAR1}创建成功 */
          )
        } else {
          Tip.danger(json.msg)
        }

        return json
      })
  }
}

actions.debounceSearchSku = (salemenu_id, keyword) => {
  return (dispatch) => {
    if (!keyword) return

    debounce(() => {
      dispatch({
        type: actionTypes.PRICE_RULE_SKU_SEARCH_LOADING,
      })

      Request('/station/skus')
        .data({
          active: 0,
          salemenu_id: salemenu_id,
          search_text: keyword,
          limit: 20, // 最大返回数
        })
        .get()
        .then((json) => {
          dispatch({
            type: actionTypes.PRICE_RULE_SKU_SEARCH_GET,
            data: json.data,
          })
        })
        .catch(() => {
          dispatch({
            type: actionTypes.PRICE_RULE_SKU_SEARCH_ERROR,
          })
        })
    })
  }
}

actions.debounceSearchObject = (salemenu_id, keyword) => {
  return (dispatch, getState) => {
    if (!keyword) return

    const { type } = getState().price_rule.ruleDetail
    let url = '/station/customer/search'
    let reqData = {
      s: keyword,
      salemenu_id: salemenu_id,
    }

    if (type === 'station') {
      url = '/station/price_rule/station/search'
      reqData = {
        search_text: keyword,
        salemenu_id: salemenu_id,
      }
    }

    debounce(() => {
      dispatch({
        type: actionTypes.PRICE_RULE_OBJECT_SEARCH_LOADING,
      })

      Request(url)
        .data(reqData)
        .get()
        .then((json) => {
          dispatch({
            type: actionTypes.PRICE_RULE_OBJECT_SEARCH_GET,
            data: json.data,
          })
        })
        .catch(() => {
          dispatch({
            type: actionTypes.PRICE_RULE_OBJECT_SEARCH_ERROR,
          })
        })
    })
  }
}

actions.price_rule_object_add = (data) => {
  return {
    type: actionTypes.PRICE_RULE_OBJECT_ADD,
    data,
  }
}

actions.price_rule_object_del = (index) => {
  return {
    type: actionTypes.PRICE_RULE_OBJECT_DEL,
    index,
  }
}

actions.price_rule_sku_add = (data) => {
  return {
    type: actionTypes.PRICE_RULE_SKU_ADD,
    data,
  }
}

actions.price_rule_sku_del = (skus, page) => {
  return {
    type: actionTypes.PRICE_RULE_SKU_DEL,
    skus: skus,
    currentPage: page,
  }
}

actions.price_rule_object_input_clear = () => {
  return {
    type: actionTypes.PRICE_RULE_OBJECT_INPUT_CLEAR,
  }
}

actions.price_rule_sku_input_clear = () => {
  return {
    type: actionTypes.PRICE_RULE_SKU_INPUT_CLEAR,
  }
}

actions.price_rule_sheet_page_change = (data) => {
  return {
    type: actionTypes.PRICE_RULE_SHEET_PAGE_CHANGE,
    data,
  }
}

actions.price_rule_sku_pagination_clear = () => {
  return {
    type: actionTypes.PRICE_RULE_SKU_PAGINATION_CLEAR,
  }
}

actions.price_rule_set_rule_object_type = (ruleObjectType) => {
  return {
    type: actionTypes.PRICE_RULE_SET_RULE_OBJECT_TYPE,
    ruleObjectType,
  }
}

actions.price_rule_detail_sku_clear = () => {
  return {
    type: actionTypes.PRICE_RULE_DETAIL_SKU_CLEAR,
  }
}

actions.price_rule_search_sku = (salemenu_id, q) => {
  return (dispatch) => {
    return Request('/product/sku_salemenu/list')
      .data({ salemenu_id, text: q, is_retail_interface: System.isC() ? 1 : null })
      .get()
  }
}

actions.price_rule_detail_not_update = (notUpdate) => {
  return {
    type: actionTypes.PRICE_RULE_DETAIL_NOT_UPDATE,
    notUpdate,
  }
}

mapActions(actions)
