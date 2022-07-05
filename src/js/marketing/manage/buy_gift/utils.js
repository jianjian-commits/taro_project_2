import { t } from 'gm-i18n'
import _ from 'lodash'

const GIFT_STATUS = [
  {
    text: t('全部'),
    value: -1,
  },
  {
    text: t('无效'),
    value: 0,
  },
  {
    text: t('有效'),
    value: 1,
  },
]

const PRESENT_TYPE = [
  {
    text: t('全部'),
    value: -1,
  },
  {
    text: t('满赠'),
    value: 1,
  },
  {
    text: t('买赠'),
    value: 2,
  },
  {
    text: t('满赠买赠'),
    value: 3,
  },
]

const CHECKBOX_PRESENT_TYPE_DATA = {
  1: [1],
  2: [2],
  3: [1, 2],
}

const STATE_DATA = [
  {
    text: t('有效'),
    value: 1,
  },
  {
    text: t('无效'),
    value: 0,
  },
]

const showStatus = (v) => {
  const res = _.find(STATE_DATA, (d) => d.value === v)
  return res?.text
}

const showPresentType = (v) => {
  const res = _.find(PRESENT_TYPE, (d) => d.value === v)
  return res?.text
}

const hasAdd = (id, data, name) => {
  const id_list = _.map(data, (item) => item[name])
  return _.includes(id_list, id)
}

const addTableCell = (data, index) => {
  return _.concat(
    _.slice(data, 0, index + 1),
    {},
    _.slice(data, index + 1, data.length),
  )
}

// 根据二级分类,过滤已有的ids
const productSearchFilter = (data, ids) => {
  const list = {}
  _.forEach(data, (item, key) => {
    const arr = list[item.category_2_name] || []
    // 过滤已添加的数据
    if (!_.includes(ids, item.sku_id)) {
      list[item.category_2_name] = _.concat(arr, {
        ...item,
        id: item.sku_id,
        value: item.sku_id,
        name: item.sku_name,
        text: `${item.sku_id} ${item.sku_name}`,
      })
    }
  })
  return list
}

export {
  GIFT_STATUS,
  PRESENT_TYPE,
  STATE_DATA,
  CHECKBOX_PRESENT_TYPE_DATA,
  hasAdd,
  addTableCell,
  showStatus,
  showPresentType,
  productSearchFilter,
}
