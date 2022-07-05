import { Request } from '@gm-common/request'

export const getDistributeData = (query) => {
  return Request('/station/distribute/get_order_by_id')
    .data(query)
    .timeout(60000)
    .get()
    .then((json) => json.data)
}

export const getPurchaseData = (query) => {
  return Request('/purchase/task/print')
    .data(query)
    .timeout(60000)
    .get()
    .then((json) => json.data)
}

export const getPurchaseTemp = (tempId) => {
  return Request('/fe/purchase_tpl/get')
    .data({ id: tempId })
    .get()
    .then((json) => json.data.content)
}

export const getDistributeTemp = (tempId) => {
  return Request('/station/distribute_config/get_new')
    .data({ id: tempId })
    .get()
    .then((json) => json.data.content)
}
