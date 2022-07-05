/**
 * @description 判断当前节点勾选状态，并将其子节点的勾选状态设为一致
 * @param {obj} value
 */
export const checkChildren = (value) => {
  const { checked, children } = value
  if (!children || children.length === 0) return

  children.forEach((item) => {
    item.checked = !!checked
    checkChildren(item)
  })
}

/**
 * @description 将树形结构拉平
 * @param {object[]} treeData
 * @param {object} flatObj
 */
export const toFlatObj = (treeData, flatObj) => {
  treeData.forEach((item) => {
    flatObj[item.id] = item
    if (item.children) toFlatObj(item.children, flatObj)
  })
}

/**
 * @description 通过当前节点勾选状态，判断其父节点是否需要勾选
 * @param {string} id
 * @param {Array<object>} treeData
 */

export const checkParent = (treeData, id) => {
  const flatTreeData = {}
  toFlatObj(treeData, flatTreeData)
  for (
    let obj = flatTreeData[id], parent;
    (parent = flatTreeData[obj.parent]);
    obj = parent
  ) {
    parent.checked = parent.children.every((item) => item.checked)
  }
}
/**
 * @description 修改treeData的某个节点
 * @param {Array<object>} treeData
 * @param {string ｜ Array<string>} id 节点id | 批量操作的id数组
 * @param {string} key 对象键名
 * @param {*} value 修改后节点的值
 */
export const onChangeNode = (treeData, id, key, value) => {
  const flatTreeData = {}
  toFlatObj(treeData, flatTreeData)
  if (Array.isArray(id)) {
    id.forEach((v) => {
      if (flatTreeData[v]) flatTreeData[v][key] = value
    })
    return
  }
  if (flatTreeData[id]) flatTreeData[id][key] = value
}

/**
 * @description 获取勾选的id集合
 * @param {Array<object>} treeData
 * @param {Array<string>} checkedList
 */
export const getCheckList = (treeData, checkedList) => {
  if (!treeData || treeData?.length === 0) return

  treeData.forEach((item) => {
    if (item.checked) {
      checkedList.push(item.id)
    } else {
      getCheckList(item.children, checkedList)
    }
  })
}

/**
 * 通过叶子节点的id在树中查找对应的叶子节点，并修改checked状态
 * @param {*} treeData
 * @param {*} id
 * @param {*} key 键名
 * @param {*} checked
 */
export const checkLeaf = (treeData, id, key, value) => {
  if (!treeData || treeData?.length === 0) return
  treeData.forEach((item) => {
    if (item.id === id) {
      return (item[key] = value)
    } else {
      checkLeaf(item.children, id, key, value)
    }
  })
}

/**
 * @description 清除 treeData 已选择数据
 * @param {Array} treeData
 */
export const clearChecked = (treeData) => {
  if (!treeData || treeData?.length === 0) return
  treeData.forEach((item) => {
    if (item.checked) item.checked = false
    clearChecked(item.children)
  })
}

/**
 * @description 从已选列表中筛选出来一级，二级，或者品类
 * @param {Array} idList
 * @param {string} type
 * @return {number} 已勾选的数量
 */
export const filterCheckList = (idList, type) => {
  const arr = []
  idList.forEach((value) => {
    // 筛选已勾选列表中的一级，二级，或品类列表   A 一级 B 二级 P 品类
    if (value.indexOf(type) !== -1) {
      arr.push(value)
    }
  })
  return [arr.length, arr]
}

/**
 *
 * @description 将所有勾选的id放到checkedList中（父节点勾选子节点也会算入）
 * @param {object[]} treeData
 * @param {Array} checkedList
 */
export const getAllCheckList = (treeData, checkedList) => {
  if (!treeData || treeData?.length === 0) return
  treeData.forEach((item) => {
    if (item.checked) {
      checkedList.push(item.id)
    }
    getAllCheckList(item.children, checkedList)
  })
}
