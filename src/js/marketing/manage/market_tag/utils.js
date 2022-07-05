import _ from 'lodash'
import { changeDomainName, isCStationAndC } from 'common/service'
import Big from 'big.js'

function getUnLeafValues(list, result = []) {
  _.each(list, (v) => {
    if (v.children) {
      result.push(v.value)
      getUnLeafValues(v.children, result)
    }
  })
  return result
}

const setItemLoading = (list, value, loading) => {
  let isFound = false
  return _.map(list, (v) => {
    if (!isFound) {
      if (v.value === value) {
        v.loading = loading
        isFound = true
      } else {
        if (v.children && v.children.length > 0) {
          v.children = setItemLoading(v.children, value, loading)
        }
      }
    }
    return v
  })
}

const setItemChildren = (list, value, childrenList) => {
  let isFound = false
  return _.map(list, (v) => {
    if (!isFound) {
      if (v.value === value) {
        v.children = childrenList
        isFound = true
      } else {
        if (v.children && v.children.length > 0) {
          v.children = setItemChildren(v.children, value, childrenList)
        }
      }
    }
    return v
  })
}

const initialLabelList = [
  {
    id: Math.random().toString().substring(3),
    name: '',
    sort: '',
  },
]

// 在label_2里修改了name，对应在skus里的label_2_name也要修改
const changeNameByLabel2 = (skuList, labelList) => {
  return _.map(skuList, (skuItem) => {
    const result = _.find(
      labelList,
      (labelItem) => labelItem.id === skuItem.label_2_id,
    )
    if (result) {
      if (skuItem.label_2_id === result.id) {
        skuItem.label_2_name = result.name
      }
    }
    return skuItem
  })
}

const sortFilter = (str) => {
  if (/^[0-9]*$/g.test(str)) {
    if (/^00/g.test(str)) {
      return false
    }
    return str.length <= 4
  }
}

// 营销活动url
const createPromotionUrl = (id, key) => {
  const shopName = isCStationAndC() ? 'cshop' : 'bshop'
  return key
    ? `${changeDomainName(
        'station',
        shopName,
      )}?cms_key=${key}#/product?is_promotion=1&first_id=${id}`
    : `${changeDomainName('station', shopName)}#/product?first_id=${id}`
}

const verifyValue = (data) => {
  // 校验限购所填内容是否可以保存
  let val = false
  const hasEmpty = _.find(
    data,
    (v) => _.trim(v.price) === '' || _.trim(v.limit_number) === '',
  )

  if (hasEmpty) {
    val = true
  } else {
    val = !!_.find(
      data,
      (v) => !v.is_price_timing && Big(v.price || 0).gte(v.sale_price || 0),
    )
  }

  return val
}

const initialSkuList = (list) => {
  return _.map(list, (v) => {
    return {
      ...v,
      latest_in_stock_price:
        v.latest_in_stock_price === 0
          ? 0
          : v.latest_in_stock_price
          ? Big(v.latest_in_stock_price || 0)
              .div(100)
              .toFixed(2)
          : '-',
      latest_quote_price:
        v.latest_quote_price === 0
          ? 0
          : v.latest_quote_price
          ? Big(v.latest_quote_price || 0)
              .div(100)
              .toFixed(2)
          : '-',
      // you
      last_in_stock_price:
        v.last_in_stock_price === 0
          ? 0
          : v.last_in_stock_price
          ? Big(Number(v.last_in_stock_price) || 0)
              .div(100)
              .toFixed(2)
          : '-',

      last_purchase_price:
        v.last_purchase_price === 0
          ? 0
          : v.last_purchase_price
          ? Big(v.last_purchase_price || 0)
              .div(100)
              .toFixed(2)
          : '-',
      last_quote_price:
        v.last_quote_price === 0
          ? 0
          : v.last_quote_price
          ? Big(v.last_quote_price || 0)
              .div(100)
              .toFixed(2)
          : '-',
      stock_avg_price:
        v.stock_avg_price === 0
          ? 0
          : v.stock_avg_price
          ? Big(v.stock_avg_price || 0)
              .div(100)
              .toFixed(2)
          : '-',
      latest_purchase_price:
        v.latest_purchase_price === 0
          ? 0
          : v.latest_purchase_price
          ? Big(v.latest_purchase_price || 0)
              .div(100)
              .toFixed(2)
          : '-',
      supplier_cycle_quote:
        v.supplier_cycle_quote === 0
          ? 0
          : v.supplier_cycle_quote
          ? Big(v.supplier_cycle_quote || 0)
              .div(100)
              .toFixed(2)
          : '-',
    }
  })
}

// 分离id集
const splitId = (id_list, pre_data) => {
  return _.filter(id_list, (key) => _.includes(Object.keys(pre_data), key))
}

const dealwithSkus = (data, type) => {
  return _.map(data.skus, (item) => {
    let res = null
    // 判断是否是限购，限购type: 2,过滤数据
    if (type === 2) {
      res = {
        id: item.id,
        label_1_name: item.label_1_name,
        label_2_name: item.label_2_name,
        price: item.price,
        limit_number: item.limit_number,
        is_price_timing: item.is_price_timing,
      }
    } else {
      res = {
        id: item.id,
        label_2_id: item.label_2_id,
        label_1_name: item.label_1_name,
        label_2_name: item.label_2_name,
      }
    }

    if (!data.enable_label_2) {
      _.forEach(['label_2_name', 'label_2_id'], (key) => {
        _.unset(res, key)
      })
    }
    res.label_1_name = data.label_1_name

    return res
  })
}

export {
  getUnLeafValues,
  setItemLoading,
  setItemChildren,
  initialLabelList,
  changeNameByLabel2,
  sortFilter,
  createPromotionUrl,
  verifyValue,
  initialSkuList,
  splitId,
  dealwithSkus,
}
