import _ from 'lodash'
import { isValid } from 'common/util'

/**
 * 将后台的成品数据转换成moreselect可用
 * @param {array} data 成品数据
 */
const formatProductSelectList = (data) => {
  const list = []

  _.each(data, (item) => {
    list.push({
      ...item,
      text: item.name,
      value: item.id,
    })
  })

  return list
}

const deleteEmptyPlanData = (data) => {
  const result = []
  _.each(data, (item) => {
    if (
      isValid(item.custom_id) ||
      isValid(item.sku_id) ||
      isValid(item.plan_amount) ||
      isValid(item.plan_start_time) ||
      isValid(item.plan_finish_time)
    ) {
      result.push({
        ...item,
      })
    }
  })

  return result
}

export { formatProductSelectList, deleteEmptyPlanData }
