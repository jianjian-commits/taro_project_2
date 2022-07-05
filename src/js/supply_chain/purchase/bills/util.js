import Big from 'big.js'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import { i18next } from 'gm-i18n'

const smartToFixed = (value) => {
  const result = Big(value || 0).toFixed(2)
  if (result.indexOf('.') === result.length - 3) {
    if (result.slice(result.length - 2) === '00') {
      return result.slice(0, result.length - 3)
    }
    if (result[result.length - 1] === '0') {
      return result.slice(0, result.length - 1)
    }
  }
  return result
}

const getPurchaseTemList = () => {
  return Request('/fe/purchase_tpl/list')
    .get()
    .then((json) => {
      return _.map(json.data, (o) => {
        return {
          type: o.id,
          name: o.content.name,
        }
      })
    })
}

const ROOT_KEY = 'list_sort_type_purchase_task_detail'

const getRuleList = (sort_by, sort_direction) => {
  if (!sort_direction) return []

  return sort_by === 'name'
    ? [{ sort_by: 'spec_name', sort_direction }]
    : [
        { sort_by: 'category_name_1', sort_direction },
        { sort_by: 'category_name_2', sort_direction },
      ]
}

const purchaseDefaultPriceName = {
  0: i18next.t('不启用'),
  1: i18next.t('供应商最近询价'),
  2: i18next.t('供应商最近采购价'),
  3: i18next.t('供应商最近入库价'),
  4: i18next.t('库存均价'),
  5: i18next.t('最近询价'),
  6: i18next.t('最近入库价'),
  9: i18next.t('供应商周期报价'),
}

export {
  smartToFixed,
  getPurchaseTemList,
  ROOT_KEY,
  getRuleList,
  purchaseDefaultPriceName,
}
