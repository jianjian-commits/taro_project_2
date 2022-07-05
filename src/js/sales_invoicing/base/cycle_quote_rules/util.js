/**
 * @description: 格式化选中项数据
 * @param {array[]} list 列表数据
 * @param {string} textField 文本字段
 * @param {string} valueField value字段
 * @param {string[]} filterIds 要过滤的商品id，即排除掉已选的
 */
function formatList({
  list = [],
  textField = '',
  valueField = '',
  filterIds = [],
}) {
  const newList = list.map((item) => ({
    ...item,
    value: item[valueField],
    text: item[textField],
  }))
  return filterIds.length
    ? newList.filter(({ value }) => !filterIds.includes(value))
    : newList
}

export { formatList }
