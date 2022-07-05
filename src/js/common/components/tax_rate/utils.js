/**
 *
 * @param {*[]} list
 * @return {*[]}
 */
export function dealProductTreeData(list) {
  return list.map((value) => {
    const { id, name, children } = value
    const option = {
      value: id,
      text: name,
    }
    if (children) {
      option.children = dealProductTreeData(children)
    }
    return option
  })
}
