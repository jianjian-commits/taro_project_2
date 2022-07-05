import { i18next } from 'gm-i18n'
import _ from 'lodash'

const getXlsxJson = (list) => {
  const colunm = _.map(list, (item) => {
    return {
      [i18next.t('商户ID')]: item.address_id,
      [i18next.t('商户名称')]: item.address_name,
      [i18next.t('商品名称')]: item.sku_name,
      [i18next.t(
        '销售规格名'
      )]: `${item.sale_ratio}${item.std_unit_name_forsale}/${item.sale_unit_name}`,
      [i18next.t('商户路线')]: item.route_name,
      [i18next.t('优先供应商ID')]: item.supplier_id,
      [i18next.t('优先供应商')]: item.supplier_name,
    }
  })
  return [colunm]
}

export { getXlsxJson }
