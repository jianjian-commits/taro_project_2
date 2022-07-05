import { i18next } from 'gm-i18n'
import _ from 'lodash'

const keyMap = {
  resname: i18next.t('商户名'),
  sku_name: i18next.t('商品名'),
  quantity: i18next.t('下单数'),
  sku_id: i18next.t('商品ID'),
  outer_id: i18next.t('自定义编码'),
  spu_remark: i18next.t('商品备注'),
  sale_price: i18next.t('单价'),
  sid: i18next.t('商户SID'),
  batch_number: i18next.t('订单分批号'),
  order_process_type_id: i18next.t('订单类型'),
  sale_unit_name: i18next.t('销售单位'),
  remark: i18next.t('订单备注'),
}

const keysFun = (type) => {
  return _.map(keyMap, (item, key) => {
    if (type === 2 && /sid|resname/.test(key)) return null
    return { value: key, text: item }
  }).filter((_) => _)
}

const getRelationColumns = (start, columns) => {
  const arr = {}
  let i = 0
  const targetIndex = start - 1
  while (
    i < columns.length - 1 &&
    (i <= targetIndex ||
      (i > targetIndex && columns[targetIndex] !== columns[i]))
  ) {
    arr[i + 1] = columns[i]
    i++
  }

  if (i >= columns.length || _.keys(arr) === 0) {
    return Promise.reject(new Error('开始循环列有误'))
  }

  return Promise.resolve(arr)
}

const hasSameItem = (list) => {
  const set = new Set(list)
  return list.length !== set.size
}

function list2Map(list) {
  const map = {}
  _.each(list, (item) => {
    map[item.value] = item
  })
  return map
}

export { keyMap, getRelationColumns, keysFun, hasSameItem, list2Map }
