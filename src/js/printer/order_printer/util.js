import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { Storage } from '@gmfe/react'

export function errorAlert(dataList, config) {
  if (_.isEmpty(dataList)) {
    window.alert(i18next.t('打印内容发生变更，返回上一页重新刷新'))
    window.closeWindow()
  }
  if (_.isEmpty(config)) {
    window.alert(i18next.t('模板数据为空,请联系客服'))
    window.closeWindow()
  }
}

/**
 * 把一张订单 按分类 切割成多个子订单
 * @param data
 * @param config
 * @returns {[]}
 */
export function splitOrderBaseOnCategory(
  { data, config },
  type,
  isCategorySuffix,
) {
  const { details, ...rest } = data
  const resultList = []

  const orderGroup = _.groupBy(details, `category_title_${type}`)
  const splitOrderList = Object.keys(orderGroup)
  const splitOrderListLength = splitOrderList.length

  // 每个分类做成一张订单
  splitOrderList.forEach((category_name, index) => {
    // 新订单数据
    const splitOrder = {
      ...rest,
      details: orderGroup[category_name],
    }
    const currentPage = index + 1
    const splitConfig = _.cloneDeep(config)

    // 分类单抬头是否展示分类后缀名
    const subText = JSON.parse(isCategorySuffix)
      ? `(${currentPage}/${splitOrderListLength} - ${category_name})`
      : `(${currentPage}/${splitOrderListLength})`

    // 修改配送单标题
    splitConfig.header.blocks[0] = {
      ...splitConfig.header.blocks[0],
      type: 'split_order_title', // 特殊的标记
      subText,
    }
    resultList.push({
      data: splitOrder,
      config: splitConfig,
    })
  })
  return resultList
}

/**
 * 把一张订单 自定义一级分类配置 切割成多个子订单
 * @param data
 * @param config
 * @param categoryConfig
 * @returns {[]}
 */
export function splitOrderBaseOnCategoryConfigStorage(
  { data, config },
  categoryConfig,
  type,
  isCategorySuffix,
) {
  const { details, ...rest } = data
  const resultList = []
  const categorySet = new Set(categoryConfig)

  const orderGroup = _.groupBy(details, (sku) => {
    const {
      category_id_1,
      category_title_1,
      category_id_2,
      category_title_2,
    } = sku
    let groupName = '__null'
    if (categorySet.has(type === 1 ? category_id_1 : category_id_2)) {
      groupName = type === 1 ? category_title_1 : category_title_2
    }
    return groupName
  })

  const splitOrderList = Object.keys(orderGroup)
  const splitOrderListLength = orderGroup.__null
    ? splitOrderList.length - 1
    : splitOrderList.length

  // 每个分类做成一张订单
  let index = 1
  splitOrderList.forEach((category_name) => {
    if (category_name !== '__null') {
      // 新订单数据
      const splitOrder = {
        ...rest,
        details: orderGroup[category_name],
      }
      const currentPage = index++
      const splitConfig = _.cloneDeep(config)

      // 分类单抬头是否展示分类后缀名
      const subText = JSON.parse(isCategorySuffix)
        ? `(${currentPage}/${splitOrderListLength} - ${category_name})`
        : `(${currentPage}/${splitOrderListLength})`

      // 修改配送单标题
      splitConfig.header.blocks[0] = {
        ...splitConfig.header.blocks[0],
        type: 'split_order_title', // 特殊的标记
        subText,
      }
      resultList.push({
        data: splitOrder,
        config: splitConfig,
      })
    }
  })
  return resultList
}

/**
 * 把一张订单 自定义一级分类配置 切割成多个子订单
 * @param data
 * @param config
 * @param categoryConfig
 * @returns {[]}
 */
export function splitOrderBaseOnCategoryConfig(
  { data, config, diy_category_toggle },
  categoryConfig,
) {
  const { details, ...rest } = data
  const resultList = []
  const categorySetList = categoryConfig.map((o) => new Set(o))
  const orderGroup = _.groupBy(details, (sku) => {
    const { category_id_1, category_id_2 } = sku
    // diy_category_toggle  1--》一级分类拆单 2--》二级分类拆单
    const category_id =
      diy_category_toggle === '1' ? category_id_1 : category_id_2
    let groupName = '__null'
    _.each(categorySetList, (groupSet, index) => {
      if (groupSet.has(category_id)) {
        groupName = index
        return false
      }
    })
    return groupName
  })

  let splitOrderList = Object.keys(orderGroup)
  let splitOrderListLength = splitOrderList.length
  // 自定义复选框
  if (
    Storage.get('Category1_groupData') ||
    Storage.get('Category2_groupData')
  ) {
    splitOrderList = _.filter(splitOrderList, (i) => i !== '__null')
    splitOrderListLength = _.filter(
      Object.keys(orderGroup),
      (i) => i !== '__null',
    ).length
  }

  // 每个分类做成一张订单
  splitOrderList.forEach((category_1_name, index) => {
    // 新订单数据
    const splitOrder = {
      ...rest,
      details: orderGroup[category_1_name],
    }
    const currentPage = index + 1
    const splitConfig = _.cloneDeep(config)
    // 修改配送单标题
    splitConfig.header.blocks[0] = {
      ...splitConfig.header.blocks[0],
      type: 'split_order_title', // 特殊的标记
      subText: `(${currentPage}/${splitOrderListLength})`,
    }
    resultList.push({
      data: splitOrder,
      config: splitConfig,
    })
  })
  return resultList
}

/**
 * 获取排序字段名 和 排序方式
 * @param sortType
 * @returns {{sortWay: *, field: string}}
 */
export function prepareSorting(sortType) {
  const pattern = /^(.+)_(desc|asc)$/
  let [, field, sortWay] = pattern.exec(sortType)

  // 字段名跟接口给的不一样,在这里转化一下
  switch (field) {
    case 'customer_name':
      field = 'resname'
      break
  }

  return {
    field,
    sortWay,
  }
}

export function isKidTemp(type) {
  if (type === 1) {
    return true
  }
  return false
}
