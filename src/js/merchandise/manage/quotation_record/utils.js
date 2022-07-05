import _ from 'lodash'

const transformPriceDateList = (data) => {
  // 拆分两组
  const { one, two } = _.reduce(
    data,
    (res, data, index) => {
      if (index % 2) {
        res.two.push(data)
      } else {
        res.one.push(data)
      }
      return res
    },
    { one: [], two: [] },
  )
  // 过滤空数据
  const filterData = _.filter([one, two], (v) => v.length)
  const res = _.map(filterData, (list) =>
    _.map(list, (v) => ({
      value: v.price_end_time,
      text: `${v.price_start_time}~${v.price_end_time}`,
    })),
  )

  return !_.flattenDeep(res).length ? [] : res
}

const transformSelected = (data) => {
  return _.map(data, (v) => ({
    ...v,
    text: v.name,
    value: v.id,
  }))
}

export { transformPriceDateList, transformSelected }
