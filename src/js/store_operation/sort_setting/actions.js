import { i18next } from 'gm-i18n'
import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { System } from '../../common/service'

const actions = {}

/**
 * 获得spu列表
 * @param  {[emun]} [spuLib=null] [全部1，通用2，私有3]
 * @param  {[int]} [offset=null] [偏移量]
 * @param  {[int]} [limit=null]  [页数最大]
 * @param  {[string]} [spuId=null]  [spuId]
 * @return {[promise]}
 */
actions.sort_setting_get_spu = (
  spuLib = null,
  spuId = null,
  pagination = null
) => {
  const spuLibMap = {
    1: null,
    2: 1,
    3: 0,
  }

  return (dispatch) => {
    const query = {
      q: spuId,
      p_type: spuLibMap[spuLib],
      ...pagination,
    }
    if (System.isC()) query.is_retail_interface = 1
    return Request('/merchandise/spu/branch')
      .data(query)
      .get()
      .then((json) => {
        _.forEach(json.data, (item) => {
          item.selected = item.dispatch_method
        })
        dispatch({
          type: actionTypes.SORT_SETTING_GET_SPU,
          spuList: json.data || [],
          pagination: json.pagination || {},
        })
      })
  }
}

actions.sort_setting_select_spu_lib = (spuLib) => {
  return {
    type: actionTypes.SORT_SETTING_SELECT_SPU_LIB,
    spuLib,
  }
}

actions.sort_setting_change_loading = (loading) => {
  return {
    type: actionTypes.SORT_SETTING_CHANGE_LOADING,
    loading,
  }
}

actions.sort_setting_change_editing = (spuId, key, value) => {
  return {
    type: actionTypes.SORT_SETTING_CHANGE_EDITING,
    payload: {
      key,
      value,
      spuId,
    },
  }
}

actions.sort_setting_change_sort_type = (spuId, sortType) => {
  const query = {
    id: spuId,
    dispatch_method: sortType,
  }
  if (System.isC()) query.is_retail_interface = 1
  return (dispatch) => {
    return Request('/merchandise/spu/update')
      .data(query)
      .post()
      .then((json) => {
        if (json.code + '' === '0') {
          Tip.success(i18next.t('修改成功'))
        } else {
          Tip.danger(i18next.t('修改失败'))
          console.error(json.msg)
          return
        }
        dispatch({
          type: actionTypes.SORT_SETTING_CHANGE_SORT_TYPE,
          spuId,
          sortType,
        })
      })
  }
}

actions.sort_setting_change_search = (search) => {
  return {
    type: actionTypes.SORT_SETTING_CHANGE_SEARCH,
    search,
  }
}

actions.sort_setting_empty_list = () => {
  return {
    type: actionTypes.SORT_SETTING_EMPTY_LIST,
  }
}

mapActions(actions)
