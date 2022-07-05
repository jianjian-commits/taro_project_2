import _ from 'lodash'

export const findByValue = (list, value) => {
  const target = _.find(list, (item) => item.value === value)
  return target ? target.text : '-'
}
