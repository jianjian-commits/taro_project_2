import { i18next } from 'gm-i18n'
// 单据类型
const BILL_TYPE = {
  '1': i18next.t('采购入库单'),
  '2': i18next.t('采购退货单'),
  '3': i18next.t('原料入库单'),
  '4': i18next.t('原料退货单'),
}

/**
 *
 * @param type 单据类型
 * @returns {*|string}
 */
const getTypeStr = (type) => {
  const typeStr = BILL_TYPE[type + '']
  return typeStr || ''
}

// 结款单状态
const SETTLE_BILL_STATUS = {
  '1': i18next.t('待提交'),
  '2': i18next.t('已提交待结款'),
  '3': i18next.t('部分结款'),
  '4': i18next.t('已结款'),
  '0': i18next.t('审核不通过'),
  '-1': i18next.t('已删除'),
}

/**
 *
 * @param status 结款单状态
 * @returns {string}
 */
const getStatusStr = (status) => {
  const statusStr = SETTLE_BILL_STATUS[status + '']
  return statusStr || ''
}

const PAYMENT_METHOD = {
  '1': i18next.t('日结'),
  '2': i18next.t('周结'),
  '3': i18next.t('半月结'),
  '4': i18next.t('月结'),
}

const receiptTypeTag = (status) => {
  switch (status + '') {
    case '1':
    case '2':
    case '3':
      return 'processing'
    case '4':
      return 'finish'
    case '0':
    case '-1':
      return 'error'
  }
}

export { getTypeStr, getStatusStr, PAYMENT_METHOD, receiptTypeTag }
