import _ from 'lodash'

export function flatTree(nodes) {
  const flatNode = {}
  const flat = (nodes, parent) => {
    for (const node of nodes) {
      flatNode[node.value] = {
        text: node.text,
        value: node.value,
        parentId: parent ? parent.value : null,
        hasChild: !!node.children,
      }
      if (node.children) {
        flat(node.children, node)
      }
    }
  }
  flat(nodes)
  return flatNode
}

export function inherit(flat) {
  const data = []
  _.forEach(flat, (item) => {
    item.level_0 = item.value
    // 找到最终的节点
    if (!item.hasChild) {
      let parent = flat[item.parentId]
      let level = 1
      while (parent) {
        item.text = parent.text + '-' + item.text
        item[`level_${level}`] = parent.value // 保存父级value
        parent = flat[parent.parentId]
        level++
      }
      data.push(_.omit(item, ['hasChild', 'parentId']))
    }
  })
  return data
}

export function getNodes(tree) {
  // 打平树
  const flat = flatTree(tree)
  // 组装最终节点（子节点包含父节点的信息）
  const nodes = inherit(flat)

  return nodes
}
