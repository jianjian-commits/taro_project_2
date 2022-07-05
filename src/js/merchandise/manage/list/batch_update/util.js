import _ from 'lodash'

const addField = (params, obj, transformer) => {
  _.forEach(obj, (val, key) => {
    if (_.isNil(val) || String(val).trim() === '') {
      return
    }
    transformer && (val = transformer(val))
    params[key] = val
  })
}

export { addField }
