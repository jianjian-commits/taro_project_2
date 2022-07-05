import _ from 'lodash'

// 把 list 打平
const listToFlat = (list, result = []) => {
  _.each(list, item => {
    if (!item.children || !item.children.length === 0) {
      result.push(item)
    } else {
      listToFlat(item.children, result)
    }
  })

  return result
}

export { listToFlat }
