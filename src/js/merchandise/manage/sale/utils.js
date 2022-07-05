import _ from 'lodash'

/**
 * 排序，// 显示顺序：逾期=》未逾期（有时间）=》无时间
 * @param {array} data 列表数据
 * @param {string} endDateName 周期结束时间的字段名
 */
const sortDataForOverdue = (data, endDateName) => {
  const overdue = []
  const normal = []
  const noTime = []

  // 添加可排序时间字段
  const timeData = _.map(data, (item) => {
    return { ...item, sortTime: new Date(item[endDateName]) }
  })

  // 排序
  const sortData = _.sortBy(timeData, ['sortTime'])

  _.each(sortData, (item) => {
    // 有结束时间
    if (item[endDateName]) {
      // 已逾期
      if (item.is_overdue) {
        overdue.push({ ...item })
      } else {
        normal.push({ ...item })
      }
    } else {
      // 无结束时间，相当于未逾期
      noTime.push({ ...item })
    }
  })
  // 显示顺序：逾期=》未逾期（有时间）=》无时间
  return overdue.concat(normal).concat(noTime)
}

export { sortDataForOverdue }
