/*
 * @Description: 方法
 */

/**
 * @description: 父级树list1和子级树list2拼接
 * @param {array} list1 父级树
 * @param {array} list2 子级树
 */
function buildTree(list1, list2, parentId = 'upstream_id') {
  list1.forEach((item) => {
    const { id, name } = item
    item.text = name
    item.value = item.id
    item.children = list2.filter((item) => {
      item.text = item.name
      item.value = item.id
      if (id === item[parentId]) {
        item.parent = id
        return true
      }
      return false
    })
  })
}
/**
 * @description: 对列表排序
 * @param {number} rank1
 * @param {number} rank2
 */
function sortList({ rank: rank1 }, { rank: rank2 }) {
  return rank1 - rank2
}
export { buildTree, sortList }
