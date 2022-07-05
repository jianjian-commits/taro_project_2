import { t } from 'gm-i18n'
import _ from 'lodash'
import { purchaseProgressUnit } from '../../common/enum'
import globalStore from 'stores/global'

const getProgressUnit = (unit) => {
  return _.find(purchaseProgressUnit, (v) => v.id === unit).name
}

const getStatusLable = (status) => {
  let statusName, bgColor
  switch (status) {
    case 1:
      statusName = t('未发')
      bgColor = '#ed6089'
      break
    case 2:
      statusName = t('已发')
      bgColor = '#86b04e'
      break
    case 3:
      statusName = t('完成')
      bgColor = '#43545c'
      break
    default:
      break
  }
  return { statusName, bgColor }
}

const purchaseDefaultPriceKey = {
  0: '',
  1: 'last_quote_price',
  2: 'last_purchase_price',
  3: 'last_in_stock_price',
  4: 'stock_avg_price',
  5: 'latest_quote_price',
  6: 'latest_in_stock_price',
  9: 'supplier_cycle_quote',
}

const getPurchasePrice = (sku) => {
  const type =
    purchaseDefaultPriceKey[globalStore.otherInfo.purchaseSheetRefPrice]
  return sku[type] || 0
}

// 值可以为0
const isValid = (val) => val !== undefined && val !== null && _.trim(val) !== ''

export {
  getProgressUnit,
  getStatusLable,
  purchaseDefaultPriceKey,
  getPurchasePrice,
  isValid,
}
