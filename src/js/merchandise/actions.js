import { i18next } from 'gm-i18n'
import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import { Tip } from '@gmfe/react'
import _ from 'lodash'
import Big from 'big.js'
import { Request } from '@gm-common/request'
import { getCategory1, getCategory2, getPinlei } from './api'

let actions = {}

actions.merchandise_common_get_all = () => {
  // merchandise store getAllMerchandise
  return (dispatch, getState) => {
    let categories = []
    let cate1Map = {}
    let cate2Map = {}
    let pinleiMap = {}
    const merchandiseCommon = getState().merchandiseCommon
    // 如果存在不走网络接口
    if (merchandiseCommon.categories.length) {
      categories = merchandiseCommon.categories
      cate1Map = merchandiseCommon.cate1Map
      cate2Map = merchandiseCommon.cate2Map
      pinleiMap = merchandiseCommon.pinleiMap
      dispatch({
        type: actionTypes.MERCHANDISE_COMMON_GET_ALL,
        categories,
        cate1Map,
        cate2Map,
        pinleiMap,
      })
      // 返回categories， 保持协议一致，返回promise
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
          type: actionTypes.MERCHANDISE_COMMON_GET_ALL,
          categories,
          cate1Map,
          cate2Map,
          pinleiMap,
        })

        return categories
      }
    )
  }
}

actions.merchandise_common_get_reference_price_type = (data) => {
  return (dispatch) => {
    return Request('/station/ref_price_type/get')
      .data({ where: data })
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_GET_REFERENCE_PRICE_TYPE,
          data: json.data.type || 1,
        })
        return json
      })
  }
}

actions.merchandise_common_set_reference_price_type = (type, where) => {
  return (dispatch) => {
    return Request('/station/ref_price_type/set')
      .data({ where: where, type: type })
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_GET_REFERENCE_PRICE_TYPE,
          data: type || 1,
        })
        return json
      })
  }
}

// 一级分类增删改
actions.merchandise_common_add_cate1 = (cate1Name, iconId) => {
  const query = {
    name: cate1Name,
    icon: iconId,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/category1/create')
      .data(query)
      .post()
      .then((json) => {
        const merchandiseCommon = getState().merchandiseCommon
        const { categories, cate1Map } = merchandiseCommon
        const cate = {
          id: json.data,
          name: cate1Name,
          icon: iconId,
          children: [],
        }
        categories.push(cate)
        cate1Map[cate.id] = cate
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_ADD_CATE1,
          id: cate.id,
          categories,
          cate1Map,
        })
      })
  }
}

actions.merchandise_common_update_cate1 = (cateId, cateName, iconId) => {
  const query = {
    id: cateId,
    name: cateName,
    icon: iconId,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/category1/update')
      .data(query)
      .post()
      .then(() => {
        const merchandiseCommon = getState().merchandiseCommon
        const { cate1Map } = merchandiseCommon
        cate1Map[cateId].name = cateName
        cate1Map[cateId].icon = iconId
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_UPDATE_CATE1,
          cate1Map,
        })
      })
  }
}

actions.merchandise_common_delete_cate1 = (cateId) => {
  const query = {
    id: cateId,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/category1/delete')
      .data(query)
      .post()
      .then(() => {
        const merchandiseCommon = getState().merchandiseCommon
        const { categories, cate1Map } = merchandiseCommon

        const index = _.findLastIndex(categories, { id: cateId })
        categories.splice(index, 1)

        delete cate1Map[cateId]

        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_DELETE_CATE1,
          id: cateId,
          categories,
          cate1Map,
        })
      })
  }
}

// 二级分类增删改
actions.merchandise_common_add_cate2 = (cate2Name, upstreamId) => {
  const query = {
    name: cate2Name,
    upstream_id: upstreamId,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/category2/create')
      .data(query)
      .post()
      .then((json) => {
        const merchandiseCommon = getState().merchandiseCommon
        const { cate1Map, cate2Map } = merchandiseCommon
        const cate = {
          id: json.data,
          upstream_id: upstreamId,
          name: cate2Name,
          children: [],
        }
        cate1Map[cate.upstream_id].children.push(cate)
        cate2Map[cate.id] = cate
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_ADD_CATE2,
          id: cate.id,
          cate1Map,
          cate2Map,
        })
      })
  }
}

actions.merchandise_common_update_cate2 = (cateId, cateName) => {
  const query = {
    id: cateId,
    name: cateName,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/category2/update')
      .data(query)
      .post()
      .then(() => {
        const merchandiseCommon = getState().merchandiseCommon
        const { cate2Map } = merchandiseCommon
        cate2Map[cateId].name = cateName
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_UPDATE_CATE2,
          cate2Map,
        })
      })
  }
}

actions.merchandise_common_delete_cate2 = (cateId, upstreamId) => {
  const query = {
    id: cateId,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/category2/delete')
      .data(query)
      .post()
      .then(() => {
        const merchandiseCommon = getState().merchandiseCommon
        const { cate1Map, cate2Map } = merchandiseCommon

        delete cate2Map[cateId]

        const cate1 = cate1Map[upstreamId]
        const index = _.findLastIndex(cate1.children, { id: cateId })
        cate1.children.splice(index, 1)

        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_DELETE_CATE2,
          id: cateId,
          cate1Map,
          cate2Map,
        })
      })
  }
}

// 品类增删改
actions.merchandise_common_add_pinlei = (pinleiName, upstreamId) => {
  const query = {
    name: pinleiName,
    upstream_id: upstreamId,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/pinlei/create')
      .data(query)
      .post()
      .then((json) => {
        const merchandiseCommon = getState().merchandiseCommon
        const { cate2Map, pinleiMap } = merchandiseCommon
        const pinlei = {
          id: json.data,
          upstream_id: upstreamId,
          name: pinleiName,
        }
        cate2Map[pinlei.upstream_id].children.push(pinlei)
        pinleiMap[pinlei.id] = pinlei
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_ADD_PINLEI,
          id: pinlei.id,
          cate2Map,
          pinleiMap,
        })
      })
  }
}

actions.merchandise_common_update_pinlei = (pinleiId, pinleiName) => {
  const query = {
    id: pinleiId,
    name: pinleiName,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/pinlei/update')
      .data(query)
      .post()
      .then(() => {
        const merchandiseCommon = getState().merchandiseCommon
        const { pinleiMap } = merchandiseCommon
        pinleiMap[pinleiId].name = pinleiName
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_UPDATE_PINLEI,
          pinleiMap,
        })
      })
  }
}

actions.merchandise_common_delete_pinlei = (pinleiId, upstreamId) => {
  const query = {
    id: pinleiId,
  }
  return (dispatch, getState) => {
    return Request('/merchandise/pinlei/delete')
      .data(query)
      .post()
      .then(() => {
        const merchandiseCommon = getState().merchandiseCommon
        const { pinleiMap, cate2Map } = merchandiseCommon

        delete pinleiMap[pinleiId]

        const cate2 = cate2Map[upstreamId]
        const index = _.findLastIndex(cate2.children, { id: pinleiId })
        cate2.children.splice(index, 1)

        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_DELETE_PINLEI,
          id: pinleiId,
          pinleiMap,
          cate2Map,
        })
      })
  }
}
// ----------------
// skuDetail 公共 |
// ---------------

/**
 * [创建采购来源(采购sku)]
 * name M string sku名称
 * desc M string sku描述
 * std_sale_price M int 采购单价
 * sale_price M int 采购价格
 * sale_unit_name M 采购单位
 * sale_ratio M float 采购规格
 * state M int 供应状态
 * image M string 图片ID
 * salemenu_id M string 报价单ID
 * spu_id M string spu ID
 */
actions.merchandise_sku_common_supply_sku_create = (supplySku) => {
  const query = {
    name: supplySku.sku_name,
    desc: supplySku.desc,
    std_sale_price: Big(supplySku.std_sale_price).times(100).toString(),
    sale_price: Big(supplySku.sale_price).times(100).toString(),
    sale_unit_name: supplySku.sale_unit_name,
    sale_ratio: supplySku.sale_ratio,
    state: supplySku.state ? 1 : 0,
    image: supplySku.image,
    salemenu_id: supplySku.salemenu_id,
    spu_id: supplySku.spu_id,
  }
  return (dispatch) => {
    return Request('/product/sku_purchase/create')
      .data(query)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_SUPPLY_SKU_CREATE,
          supplySku: Object.assign({}, supplySku, { sku_id: json.data }),
        })
      })
  }
}

actions.merchandise_sku_common_loading = (data = true) => {
  return {
    type: actionTypes.MERCHANDISE_SKU_COMMON_LOADING,
    data,
  }
}

mapActions(actions)
