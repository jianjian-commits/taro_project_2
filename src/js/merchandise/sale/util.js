import { i18next } from 'gm-i18n'
import { isNumber } from '../../common/util'
import _ from 'lodash'

function getStockType(type) {
  const stockMap = {
    0: i18next.t('读取上游库存'),
    1: i18next.t('不限库存'),
    2: i18next.t('设置固定库存'),
    3: i18next.t('限制库存'),
  }
  if (isNumber(type) && stockMap[type]) {
    return stockMap[type]
  }
  return ''
}

// sku_id 优先判断 若有sku_id 以传入的sku_id为主，否则find _gm_select
const getBatchFilter = (filter, saleList, salemenu_id, sku_id) => {
  const {
    categoryFilter: { category1_ids, category2_ids, pinlei_ids },
    state,
    text,
    formula,
  } = filter
  const { list, selectAllType, selected, selectAll } = saleList
  let data = {
    all: sku_id ? 0 : selectAll && selectAllType === 2 ? 1 : 0,
  }

  if (sku_id) {
    data = Object.assign({}, data, {
      sku_list: JSON.stringify([sku_id]),
    })
  } else if (selectAll && selectAllType === 2) {
    data = Object.assign({}, data, {
      category1_ids: JSON.stringify(_.map(category1_ids, (v) => v.id)),
      category2_ids: JSON.stringify(_.map(category2_ids, (v) => v.id)),
      pinlei_ids: JSON.stringify(_.map(pinlei_ids, (v) => v.id)),
      salemenu_ids: JSON.stringify([salemenu_id]),
      q: text,
      state,
    })
    if (formula !== -1) data = Object.assign({}, data, { formula })
  } else {
    let sku_list = []
    _.forEach(list, (l) => {
      if (selected.includes(l._skuId)) sku_list.push(l.sku_id)
    })

    data = Object.assign({}, data, {
      sku_list: JSON.stringify(sku_list),
    })
  }

  return data
}

const getQueryFilter = (filter, salemenuId) => {
  const {
    categoryFilter: { category1_ids, category2_ids, pinlei_ids },
    text,
    state,
    formula,
  } = filter
  let data = {
    category1_ids: JSON.stringify(_.map(category1_ids, (v) => v.id)),
    category2_ids: JSON.stringify(_.map(category2_ids, (v) => v.id)),
    pinlei_ids: JSON.stringify(_.map(pinlei_ids, (v) => v.id)),
    text: text,
    state: state,
    salemenu_id: salemenuId,
  }
  if (formula !== -1) data = Object.assign({}, data, { formula })
  return data
}

export { getStockType, getBatchFilter, getQueryFilter }
