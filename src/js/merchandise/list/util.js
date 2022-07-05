import _ from 'lodash'
import Big from 'big.js'
import { System } from '../../common/service'

// todo 添加isShowUnActive字段,记录全部筛选字段，若不需要某字段请另行删除
function getQueryFilter(state) {
  const { filter, query, formula, isShowUnActive } = state
  let params = {
    category1_ids: JSON.stringify(_.map(filter.category1_ids, (v) => v.id)),
    category2_ids: JSON.stringify(_.map(filter.category2_ids, (v) => v.id)),
    pinlei_ids: JSON.stringify(_.map(filter.pinlei_ids, (v) => v.id)),
    salemenu_ids: JSON.stringify(_.map(filter.salemenu_ids, (v) => v.id)),
    q: query,
  }
  if (formula !== -1) params = Object.assign({}, params, { formula })
  if (!isShowUnActive)
    params = Object.assign({}, params, { salemenu_is_active: 1 })
  return params
}

const addField = (params, obj, transformer) => {
  _.forEach(obj, (val, key) => {
    if (_.isNil(val) || String(val).trim() === '') {
      return
    }
    transformer && (val = transformer(val))
    params[key] = val
  })
}

// sku_id 优先判断 若有sku_id 以传入的sku_id为主，否则find _gm_select
const getBatchSkuFilter = (state, sku_id) => {
  const { list, selectAllType, isSelectAll, isShowUnActive, formula } = state
  let data = {
    all: sku_id ? 0 : isSelectAll && selectAllType === 2 ? 1 : 0,
  }

  if (sku_id) {
    data = Object.assign({}, data, {
      sku_list: JSON.stringify([sku_id]),
    })
  } else if (isSelectAll && selectAllType === 2) {
    data = Object.assign({}, data, getQueryFilter(state))
  } else {
    let selectSkuList = []
    _.forEach(list, (l) => {
      if (l.skus.length) {
        selectSkuList = _.concat(
          selectSkuList,
          _.filter(l.skus, (v) => v._gm_select)
        )
        if (!isShowUnActive)
          selectSkuList = _.filter(selectSkuList, (v) => v.salemenu_is_active)
        if (formula === 1)
          selectSkuList = _.filter(selectSkuList, (v) => v.formula_status === 1)
        if (formula === 0)
          selectSkuList = _.filter(selectSkuList, (v) => v.formula_status === 0)
      }
    })

    data = Object.assign({}, data, {
      sku_list: JSON.stringify(_.map(selectSkuList, (v) => v.sku_id)),
    })
  }
  if (System.isC()) data.is_retail_interface = 1

  return data
}

const getBatchSpuFilter = (state) => {
  const { list, selectAllType, isSelectAll } = state
  let data = {
    all: isSelectAll && selectAllType === 2 ? 1 : 0,
  }

  if (isSelectAll && selectAllType === 2) {
    data = _.omit(Object.assign({}, data, getQueryFilter(state)), [
      'formula',
      'salemenu_is_active',
    ])
  } else {
    let spu_list = []
    _.forEach(list, (l) => {
      if (l._gm_select) spu_list.push(l.spu_id)
    })

    data = Object.assign({}, data, {
      spu_list: JSON.stringify(spu_list),
    })
  }
  return data
}

const getSkuPriceRange = (skus) => {
  const arr = _.groupBy(skus, 'fee_type')
  return _.map(arr, (val, k) => {
    let min = 0
    let max = 0
    if (val.length !== 0) {
      min = Big(_.min(_.map(val, (v) => v.std_sale_price_forsale)))
        .div(100)
        .toFixed(2)
      max = Big(_.max(_.map(val, (v) => v.std_sale_price_forsale)))
        .div(100)
        .toFixed(2)
    }
    return {
      min,
      max,
      fee_type: k,
    }
  })
}

const filterSkuByFeeType = (skus, fee_type, isSelected = false) => {
  let skuIds = []
  if (isSelected) {
    skuIds = _.map(skus, (v) => {
      if (v._gm_select && v.fee_type === fee_type) return v.sku_id
    })
  } else {
    skuIds = _.map(skus, (v) => {
      if (v.fee_type === fee_type) return v.sku_id
    })
  }
  return _.filter(skuIds, (s) => !!s)
}

export {
  getQueryFilter,
  addField,
  getBatchSkuFilter,
  getBatchSpuFilter,
  getSkuPriceRange,
  filterSkuByFeeType,
}
