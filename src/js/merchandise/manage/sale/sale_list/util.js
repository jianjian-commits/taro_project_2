import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import { System } from '../../../../common/service'

const getBatchFilter = (filter, isSelectAllPage, selectedList, salemenu_id) => {
  const {
    categoryFilter: { category1_ids, category2_ids, pinlei_ids },
    state,
    text,
    formula,
    has_images,
    is_price_timing,
  } = filter
  let data = {
    all: isSelectAllPage ? 1 : 0,
  }

  if (isSelectAllPage) {
    data = Object.assign({}, data, {
      category1_ids: JSON.stringify(_.map(category1_ids, (v) => v.id)),
      category2_ids: JSON.stringify(_.map(category2_ids, (v) => v.id)),
      pinlei_ids: JSON.stringify(_.map(pinlei_ids, (v) => v.id)),
      salemenu_ids: JSON.stringify([salemenu_id]),
      q: text,
      state: state === '-1' ? null : state,
    })
    if (formula !== -1) data = Object.assign({}, data, { formula })
    if (has_images !== -1) data = Object.assign({}, data, { has_images })
    if (is_price_timing !== -1)
      data = Object.assign({}, data, { is_price_timing })
  } else {
    data = Object.assign({}, data, {
      sku_list: JSON.stringify(selectedList),
    })
  }
  if (System.isC()) data.is_retail_interface = 1

  return data
}

const getQueryFilter = (filter, salemenuId) => {
  const {
    categoryFilter: { category1_ids, category2_ids, pinlei_ids },
    text,
    state,
    formula,
    has_images,
    is_price_timing,
    is_clean_food,
    process_label_id,
  } = filter
  let data = {
    category1_ids: JSON.stringify(_.map(category1_ids, (v) => v.id)),
    category2_ids: JSON.stringify(_.map(category2_ids, (v) => v.id)),
    pinlei_ids: JSON.stringify(_.map(pinlei_ids, (v) => v.id)),
    text: text,
    state: state === '-1' ? null : state,
    salemenu_id: salemenuId,
  }
  if (formula !== -1) data = Object.assign({}, data, { formula })
  if (has_images !== -1) data = Object.assign({}, data, { has_images })
  if (is_price_timing !== -1) {
    data = Object.assign({}, data, { is_price_timing })
  }
  if (is_clean_food !== -1) {
    // -1是全部
    data = Object.assign({}, data, { is_clean_food })
  }
  if (process_label_id !== 0) {
    // 0是全部
    data = Object.assign({}, data, { process_label_id })
  }
  if (System.isC()) data.is_retail_interface = 1
  return data
}

// 与 priceDateList 保存一致
const priceDateSelectedList = [
  {
    value: 7,
    text: `近7天(${moment()
      .subtract(6, 'days')
      .format('YYYY-MM-DD')}-${moment().format('YYYY-MM-DD')})`,
  },
  {
    value: 15,
    text: `近15天(${moment()
      .subtract(14, 'days')
      .format('YYYY-MM-DD')}-${moment().format('YYYY-MM-DD')})`,
  },
  {
    value: 30,
    text: `近30天(${moment()
      .subtract(29, 'days')
      .format('YYYY-MM-DD')}-${moment().format('YYYY-MM-DD')})`,
  },
]

const priceDateList = {
  7: {
    start_time: moment().subtract(6, 'days').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
  },
  15: {
    start_time: moment().subtract(14, 'days').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
  },
  30: {
    start_time: moment().subtract(29, 'days').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
  },
}

const transformList = ({ dateSelected, start_time, data, end_time }) => {
  const res = _.map(new Array(dateSelected), (o, index) => {
    // 获取对应周期日期
    const date = moment(end_time).subtract(index, 'days')
    // 单个商品，获取第一个数据
    const list = _.head(data).snapshot_list
    // 获取日期对应数据
    const filterDate = _.filter(list, (item) => {
      const endDate = moment(item.next_modify_time)
      const startDate = moment(item.modify_time)
      // start <= date < end,在区间内则是这个价格
      if (date.isSame(startDate) || date.isSame(endDate)) {
        return true
      }
      if (date.isBefore(endDate) && date.isAfter(startDate)) {
        return true
      }
      return false
    })
    return {
      date: date.format('YYYY-MM-DD'),
      price: Big(_.last(filterDate)?.std_sale_price_forsale || 0)
        .div(100)
        .toFixed(2),
    }
  })
  return res
}

export {
  getBatchFilter,
  getQueryFilter,
  priceDateSelectedList,
  priceDateList,
  transformList,
}
