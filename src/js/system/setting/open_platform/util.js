import _ from 'lodash'

function sortWithKey(data, keys) {
  // keys 优先排
  const _data = { ...data }
  const _obj = {}
  _.forEach(keys, (item) => {
    if (_data[item]) {
      _obj[item] = _data[item]
      delete _data[item]
    }
  })
  return { ..._obj, ..._data }
}

/**
 *
 * @param {*} list [{value, text, ...}, ...]
 */
function list2Map(list) {
  const map = {}
  _.each(list, (item) => {
    map[item.value] = item
  })
  return map
}

export { sortWithKey, list2Map }
