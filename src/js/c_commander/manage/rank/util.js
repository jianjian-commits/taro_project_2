/**
 * 排序
 * @param {string} name 属性名
 * @param {array} updateList
 * @param {string 'asc' || 'desc' || null} direction 排序方式
 */
export const quickSort = (name, updateList, direction) => {
  if (!updateList.length) return updateList.slice()

  let sortList = []
  if (direction === 'asc') {
    sortList = updateList.sort((a, b) => a[name] - b[name])
  } else if (direction === 'desc') {
    sortList = updateList.sort((a, b) => b[name] - a[name])
  } else {
    sortList = updateList.slice()
  }
  return sortList
}

// 假分页
export const pageByLimit = (list = [], limit) => {
  let index = 0
  const newList = []

  while (index < list.length) {
    newList.push(list.slice(index, (index += limit)))
  }
  return newList
}
