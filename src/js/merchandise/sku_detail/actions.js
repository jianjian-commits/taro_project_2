import { mapActions } from 'redux-async-actions-reducers'
import actionTypes from './action.types'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { addTurnOverFields } from '../util'
import Big from 'big.js'
import { isNumber } from '../../common/util'
import globalStore from '../../stores/global'

const actions = {}
// get spu detail
actions.merchandise_list_spu_detail = (data = { spu_id: '1' }) => {
  return (dispatch) => {
    return Request('/merchandise/spu/details')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_SPU_DETAIL,
          data: json.data,
        })
      })
  }
}
actions.merchandise_spu_category = (data = { id: '1' }) => {
  return (dispatch) => {
    return Request('/merchandise/pinlei/detail')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SPU_CATEGORY,
          data: json.data,
        })
      })
  }
}
actions.merchandise_list_spu_list = (data = { pinlei_id: '1' }) => {
  return (dispatch) => {
    return Request('/merchandise/spu/list')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_SPU_LIST,
          data: json.data,
        })
      })
  }
}
actions.merchandise_list_spu_detail_init = () => {
  return {
    type: actionTypes.MERCHANDISE_LIST_SPU_DETAIL_INIT,
  }
}
actions.merchandise_list_spu_detail_change = (name, value) => {
  return {
    type: actionTypes.MERCHANDISE_LIST_SPU_DETAIL_CHANGE,
    name,
    value,
  }
}
actions.merchandise_list_spu_update = (data = {}) => {
  return (dispatch) => {
    return Request('/merchandise/spu/update')
      .data(data)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_SPU_UPDATE,
          data: json.data,
        })
      })
  }
}
actions.merchandise_list_spu_create = (data = {}) => {
  return (dispatch) => {
    return Request('/merchandise/spu/create')
      .data(data)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_LIST_SPU_CREATE,
          data: json.data,
        })
        return json
      })
  }
}
actions.merchandise_spu_delete = (data = { id: '1' }) => {
  return (dispatch) => {
    return Request('/merchandise/spu/delete')
      .data(data)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SPU_DELETE,
          data: json.data,
        })
      })
  }
}
actions.merchandise_spu_img_upload = (file, what, index) => {
  return (dispatch) => {
    return Request('/image/upload')
      .data({
        image_file: file,
      })
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SPU_IMG_UPLOAD,
          data: json.data,
          what,
          index,
        })
      })
  }
}
// 删除spu图片
actions.merchandise_spu_delete_image = (index) => {
  return {
    type: actionTypes.MERCHANDISE_SPU_DELETE_IMAGE,
    index,
  }
}
// 删除sku图片
actions.merchandise_sku_delete_image = (index) => {
  return {
    type: actionTypes.MERCHANDISE_SKU_DELETE_IMAGE,
    index,
  }
}
// 将所有spu图片同步至sku图片中
actions.merchandise_spu_sync_img_to_sku = (spuId, salemenuId) => {
  const query = {
    spu_id: spuId,
    salemenu_id: salemenuId,
  }
  return (dispatch) => {
    return Request('/product/sku_image/change')
      .data(query)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SPU_SYNC_IMG_TO_SKU,
          data: json.data,
        })
      })
  }
}

// 获得某个spu下的所有sku
actions.merchandise_sku_common_sku_list = (spuId, salemenuId) => {
  const query = {
    spu_id: spuId,
    salemenu_id: salemenuId,
  }
  return (dispatch) => {
    return Request('/product/sku_sale/list')
      .data(query)
      .get()
      .then((json) => {
        const skuList = _.each(json.data, (sku) => {
          sku.sale_price = Big(sku.sale_price).div(100).toString()
          sku.std_sale_price_forsale = Big(sku.std_sale_price_forsale)
            .div(100)
            .toString()
          sku.suggest_price_max = _.isNull(sku.suggest_price_max)
            ? ''
            : Big(sku.suggest_price_max).div(100).toFixed(2)
          sku.suggest_price_min = _.isNull(sku.suggest_price_min)
            ? ''
            : Big(sku.suggest_price_min).div(100).toFixed(2)
          // 周转物关联关闭状态 给个默认的换算方式
          if (!sku.bind_turnover && !sku.turnover_bind_type) {
            sku.turnover_bind_type = 1
          }
        })
        dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_SKU_LIST,
          skuList,
        })
      })
  }
}

// 获得用户报价单列表
// type O int 报价单类型(-1:已删除;1:供应商报价单;2:代售单;4:自售单)
// is_active O int 报价单状态(0:未激活; 1:激活)
actions.merchandise_sku_common_sale_list = (salemenuType, isActive) => {
  const query = {
    type: salemenuType,
    is_active: isActive,
  }
  return (dispatch) => {
    return Request('/salemenu/list')
      .data(query)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_SALE_LIST,
          saleList: json.data,
        })
      })
  }
}
// 获得某spu的采购来源列表
actions.merchandise_sku_common_supply_list = (data) => {
  return (dispatch) => {
    return Request('/product/sku_supplier/list_new')
      .data(data)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_SUPPLY_LIST,
          supplyList: json.data,
        })
      })
  }
}

// 修改sku表单信息(skuDetail)
actions.merchandise_sku_common_change_sku_info = (skuInfo) => {
  return {
    type: actionTypes.MERCHANDISE_SKU_COMMON_CHANGE_SKU_INFO,
    changeData: skuInfo || {},
  }
}

// 修改sku中净菜类信息(skuDetail.clean_food_info)
actions.merchandise_sku_change_clean_food_info = (cleanFoodInfo) => {
  return {
    type: actionTypes.MERCHANDISE_SKU_CHANGE_CLEAN_FOOD_INFO,
    changeData: cleanFoodInfo || {},
  }
}

// 上传sku图片
actions.merchandise_sku_common_img_upload = (file, what, index) => {
  return (dispatch) => {
    return Request('/image/upload')
      .data({
        image_file: file,
      })
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_IMG_UPLOAD,
          data: json.data,
          what,
          index,
        })
      })
  }
}
// sku选择
actions.merchandise_sku_common_sku_selected = (skuId) => {
  return {
    type: actionTypes.MERCHANDISE_SKU_COMMON_SKU_SELECTED,
    skuId,
  }
}
/**
 * [更新sku]
 * @param  {[object]} skuInfo [sku信息]
 * id M string sku ID
 * name O string spu名称
 * desc O string spu描述
 * std_sale_price_forsale O int 销售计量单位单价
 * sale_price O int 销售价格
 * sale_unit_name O 销售单位
 * sale_ratio O float 销售规格
 * sale_num_least O int 最小下单数
 * attrition_rate O float 损耗率
 * state O int 销售状态
 * is_weigh O bool 是否称重
 * is_price_timing 是否时价
 * suggest_price_min 建议价格区间下限
 * suggest_price_max 建议价格区间上限
 * slitting M bool 能否分切
 * partframe M bool 能否投筐
 * stock_type O int 设置库存(0:读取上游库存;1:不设置库存;2:设置库存)
 * stocks O int 库存数量
 * images O array 图片名称
 * salemenu_id O string 报价单ID
 * std_unit_name_forsale O string 销售计量单位
 * @param {[string]} updateType [更新类型]
 * supply 来源
 * sale   销售商品
 * bind_turnover    bool   是否开启周转物关联
 * tid         str    关联周转物id
 * turnover_bind_type    int    1固定值/2按比例
 * turnover_ratio     float  周转物数量
 */
actions.merchandise_sku_common_sku_update = (skuInfo) => {
  // 如果是净菜，必须把多物料列表中物料ID为空的物料给过滤掉，不发给后台
  // 传图片文件名给后端
  const imgUrlList = skuInfo.imgUrlList || []

  let query = {
    id: skuInfo.sku_id,
    name: skuInfo.sku_name,
    desc: skuInfo.desc,
    std_sale_price_forsale: Big(skuInfo.std_sale_price_forsale || 0)
      .times(100)
      .toString(),
    sale_price: Big(skuInfo.sale_price || 0)
      .times(100)
      .toString(),
    sale_unit_name: skuInfo.sale_unit_name,
    std_unit_name_forsale: skuInfo.std_unit_name_forsale,
    sale_ratio: skuInfo.sale_ratio,
    sale_num_least: skuInfo.sale_num_least,
    attrition_rate: skuInfo.attrition_rate,
    state: skuInfo.state ? 1 : 0,
    is_weigh: skuInfo.is_weigh ? 1 : 0,
    is_price_timing: skuInfo.is_price_timing ? 1 : 0,
    slitting: skuInfo.slitting ? 1 : 0,
    partframe: skuInfo.partframe ? 1 : 0,
    stock_type: skuInfo.stock_type,
    stocks: skuInfo.stocks,
    images: JSON.stringify(
      imgUrlList.map((img) => {
        const arr = img.split('/')
        return arr[arr.length - 1]
      })
    ),
    outer_id: skuInfo.outer_id,
    supplier_id: skuInfo.supplier_id,
    purchase_spec_id: skuInfo.purchase_spec_id,
    clean_food: skuInfo.clean_food ? 1 : 0, // 净菜专用
    remark_type: skuInfo.remark_type, // 净菜专用
    ingredients: JSON.stringify(
      _.filter(skuInfo.ingredients, (ingredient) => ingredient.id)
    ), // 净菜专用
    clean_food_info: JSON.stringify(skuInfo.clean_food_info), // 净菜专用
  }
  // 从 skuInfo 添加周转物相关字段 到query
  // skuInfo 没有这些字段就不加
  if (globalStore.hasPermission('add_turnover_sku_info')) {
    query = addTurnOverFields(query, skuInfo)
  }

  if (globalStore.otherInfo.showSuggestPrice && !skuInfo.is_price_timing) {
    query.suggest_price_min = isNumber(skuInfo.suggest_price_min)
      ? Big(skuInfo.suggest_price_min).times(100).toString()
      : skuInfo.suggest_price_min
    query.suggest_price_max = isNumber(skuInfo.suggest_price_max)
      ? Big(skuInfo.suggest_price_max).times(100).toString()
      : skuInfo.suggest_price_max
  }

  // 如果开启了时价【skuInfo.is_timing_price === 1】，则价格相关的字段不需要传给后台
  return (dispatch) => {
    return Request('/product/sku/update')
      .data(query)
      .post()
      .then(() => {
        dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_SKU_UPDATE,
          updateInfo: skuInfo,
        })
      })
  }
}
/**
 * [创建售卖sku]
 * @param  {[object]} saleSku [售卖sku信息]
 * name M string sku名称
 * desc M string sku描述
 * std_sale_price_forsale M int 销售计量单位单价
 * sale_price M int 销售价格
 * sale_unit_name M string 销售单位
 * std_unit_name_forsale O string 销售计量单位
 * sale_ratio M float 销售规格
 * sale_num_least M int 最小下单数
 * attrition_rate M float 损耗率
 * state M int 销售状态
 * is_weigh M bool 是否称重
 * is_price_timing 是否时价
 * suggest_price_min 建议价格区间下限
 * suggest_price_max 建议价格区间上限
 * slitting M bool 能否分切
 * partframe M bool 能否投筐
 * stock_type M int 设置库存(0:读取上游库存;1:不设置库存;2:设置库存)
 * stocks O int 库存数量(stock_type为2时表示库存数量)
 * images M array 图片ID
 * salemenu_id M string 报价单ID
 * spu_id M string spu ID
 * bind_turnover    bool   是否开启周转物关联
 * tid         str    关联周转物id
 * turnover_bind_type    int    1固定值/2按比例
 * turnover_ratio      float  周转物数量
 */
actions.merchandise_sku_common_sale_sku_create = (saleSku) => {
  // 如果是净菜，必须把多物料列表中物料ID为空的物料给过滤掉，不发给后台
  const imgUrlList = saleSku.imgUrlList || []

  let query = {
    attrition_rate: saleSku.attrition_rate,
    desc: saleSku.desc,
    images: JSON.stringify(
      imgUrlList.map((img) => {
        const arr = img.split('/')
        return arr[arr.length - 1]
      })
    ),
    is_weigh: saleSku.is_weigh ? 1 : 0,
    partframe: saleSku.partframe ? 1 : 0,
    sale_num_least: saleSku.sale_num_least,
    sale_price: Big(saleSku.sale_price || 0).times(100),
    std_sale_price_forsale: Big(saleSku.std_sale_price_forsale || 0).times(100),
    sale_ratio: saleSku.sale_ratio,
    name: saleSku.sku_name,
    slitting: saleSku.slitting ? 1 : 0,
    is_price_timing: saleSku.is_price_timing ? 1 : 0,
    state: saleSku.state ? 1 : 0,
    sale_unit_name: saleSku.sale_unit_name,
    std_unit_name_forsale: saleSku.std_unit_name_forsale,
    stock_type: saleSku.stock_type,
    stocks: saleSku.stocks,
    salemenu_id: saleSku.salemenu_id,
    spu_id: saleSku.spu_id,
    outer_id: saleSku.outer_id,
    supplier_id: saleSku.supplier_id,
    purchase_spec_id: saleSku.purchase_spec_id,
    clean_food: saleSku.clean_food ? 1 : 0, // 净菜专用
    remark_type: saleSku.remark_type, // 净菜专用
    ingredients: JSON.stringify(
      _.filter(saleSku.ingredients, (ingredient) => ingredient.id)
    ), // 净菜专用
    clean_food_info: JSON.stringify(saleSku.clean_food_info), // 净菜专用
  }

  // 新增周转物相关字段
  if (globalStore.hasPermission('add_turnover_sku_info')) {
    query = addTurnOverFields(query, saleSku)
  }

  if (globalStore.otherInfo.showSuggestPrice && !saleSku.is_price_timing) {
    query.suggest_price_min = isNumber(saleSku.suggest_price_min)
      ? Big(saleSku.suggest_price_min).times(100).toString()
      : saleSku.suggest_price_min
    query.suggest_price_max = isNumber(saleSku.suggest_price_max)
      ? Big(saleSku.suggest_price_max).times(100).toString()
      : saleSku.suggest_price_max
  }

  return (dispatch) => {
    return Request('/product/sku_sale/create')
      .data(query)
      .post()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_SALE_SKU_CREATE,
          saleSku: {
            ...saleSku,
            sku_id: json.data,
          },
        })
        return json
      })
  }
}
actions.merchandise_sku_common_reset_store = () => {
  return {
    type: actionTypes.MERCHANDISE_SKU_COMMON_RESET_STORE,
  }
}
// 删除sku
actions.merchandise_sku_common_sku_delete = (deleteSkuId) => {
  return (dispatch) => {
    return Request('/product/sku/delete')
      .data({ id: deleteSkuId })
      .post()
      .then(() => {
        return dispatch({
          type: actionTypes.MERCHANDISE_SKU_COMMON_SKU_DELETE,
          deleteSkuId,
        })
      })
  }
}
// 周转物下拉框接口
actions.merchandise_get_material_list = () => {
  return () => {
    return Request('/station/turnover/simple_list').get()
  }
}

actions.merchandise_get_purchase_specification_list = (data) => {
  return () => {
    return Request('/product/sku_spec/list').data(data).get()
  }
}

actions.merchandise_purchase_specification_create = (data) => {
  return () => {
    return Request('/purchase_spec/create').data(data).post()
  }
}

// 获得某净菜多物料的默认供应商，这里拉取出所有的供应商
actions.merchandise_sku_common_ingredient_supply_list = () => {
  return () => {
    return Request('/supplier/search').data({ offset: 0, limit: 9999 }).get()
  }
}

// 物料信息 商品和采购规格搜索
actions.merchandise_common_get_ingredient_list = (q) => {
  return (dispatch) => {
    return Request('/product/sku/ingredient/list')
      .data(q)
      .get()
      .then((json) => {
        dispatch({
          type: actionTypes.MERCHANDISE_COMMON_GET_INGREDIENT_LIST,
          data: _.map(json.data, (d) => {
            return {
              label: `${d.category1_name}/${d.category2_name}`,
              children: d.ingredients,
            }
          }),
        })
        return json.data
      })
  }
}

// 物料信息 清除采购规格
actions.merchandise_common_clear_ingredient_list = () => {
  return {
    type: actionTypes.MERCHANDISE_COMMON_GET_INGREDIENT_LIST,
    data: [],
  }
}

mapActions(actions)
