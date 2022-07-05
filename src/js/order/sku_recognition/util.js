import _ from 'lodash'
import { dealCombineGoodsData, setSalePriceIfCombineGoods } from '../util'

const getExpanded = (list) => {
  const map = {}
  _.forEach(list, (item, i) => {
    const others = item.others
    map[i] = others && others.length > 0
  })
  return map
}

/* list 成功匹配的索引[[ start, end, underfind ], ...]
 *  to
 *  所有索引 [[ start, end, isInvaild ], ...]
 */
const getRecognitionIndex = (length, list) => {
  const index = []
  const listLength = list.length
  if (!listLength) {
    return [[0, length, 1]]
  }
  if (list[0] && list[0][0] !== 0) {
    index.push([0, list[0][0], 1])
  }
  _.forEach(list, (item, i) => {
    const current = list[i].slice()
    const next = list[i + 1]
    index.push(current)
    if (next && next[0] !== current[1]) {
      index.push([current[1], next[0], 1])
    }
  })

  if (list[listLength - 1] && list[listLength - 1][1] !== length) {
    index.push([list[listLength - 1][1], length, 1])
  }
  return index
}

// list 是二位🔢
const getExpanderList = (list) => {
  // 加入组合商品
  let result = []
  _.each(list, (vaild) => {
    const arr = vaild.slice()
    const firstItem = arr.shift()
    if (firstItem.is_combine_goods) {
      const combines = dealCombineGoodsData(firstItem, firstItem.sale_num)
      if (combines.length) {
        const item = combines[0]
        item.others = arr
        setSalePriceIfCombineGoods(combines)
        result = result.concat(combines)
      }
    } else {
      result.push({
        ...firstItem,
        quantity: firstItem.sale_num || firstItem.sale_num_last,
        others: arr,
      })
    }
  })
  return result
}

const getRecognitionLength = (list) => {
  return _.filter(list, (item) => !item.belongWith).length
}

export {
  getExpanded,
  getRecognitionIndex,
  getExpanderList,
  getRecognitionLength,
}
