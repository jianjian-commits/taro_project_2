import _ from 'lodash'
const weeks = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]
export const getId = (list, type) => {
  return _.map(list, (item) => item[type])
}

export const getIdValueList = (list) => {
  return _.map(list, (item) => {
    return {
      combine_id: item.id ?? item.value,
    }
  })
}

export const getCombineIdsList = (list) => {
  const combineIds = new Set([])
  _.forEach(weeks, (week) => {
    _.forEach(list[week], (item) => {
      combineIds.add(item.id ?? item.value)
    })
  })
  return combineIds
}

export const getCookbookInfo = (cookbookInfo) => {
  return _.map(cookbookInfo, (item, index) => {
    return {
      ...item,
      monday: getIdValueList(item.monday),
      tuesday: getIdValueList(item.tuesday),
      wednesday: getIdValueList(item.wednesday),
      thursday: getIdValueList(item.thursday),
      friday: getIdValueList(item.friday),
      saturday: getIdValueList(item.saturday),
      sunday: getIdValueList(item.sunday),
      sort: index,
      combine_ids: [...getCombineIdsList(item)],
    }
  })
}
