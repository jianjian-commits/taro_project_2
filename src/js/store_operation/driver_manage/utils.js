import _ from 'lodash'

function generateListForTransfer(detail, routeId) {
  const list = []
  const selectedValues = []
  let objValue = 1
  const raw = _.groupBy(detail, 'area')
  _.forEach(raw, (areaItem, key) => {
    const obj = {}
    obj.name = key
    obj.value = objValue
    objValue++
    obj.children = []
    _.forEach(areaItem, (item) => {
      const child = {}
      child.name = item.route_id
        ? `${item.name}-${item.address_label_name}（${item.route_name}）`
        : `${item.name}-${item.address_label_name}`
      child.value = item.sid
      if (item.route_id === routeId) {
        selectedValues.push(item.sid)
      }
      obj.children.push(child)
    })
    list.push(obj)
  })
  return {
    list: list,
    selectedValues: selectedValues,
  }
}

export { generateListForTransfer }
