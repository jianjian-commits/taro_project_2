import { t } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import { isNil } from 'lodash'
import { convertSid2Number } from 'common/filter'

/**
 * @param name
 * @param addresses {Array}
 * @param category {Array}
 * @return {boolean}
 */
export function checkData(name, addresses, category) {
  let error = false
  if (!name) {
    Tip.warning(t('请输入税率规则名'))
    error = true
  }
  if (!addresses.length) {
    Tip.warning(t('请添加商户'))
    error = true
  }
  if (!category.length) {
    Tip.warning(t('请添加商品'))
    error = true
  }
  if (
    category.some((item) =>
      item.children.some((child) => isNil(child.tax_rate))
    )
  ) {
    Tip.warning(t('请输入税率'))
    error = true
  }
  return error
}

/**
 * @param tax_name
 * @param status
 * @param address
 * @param category
 * @param tax_id
 * @return {{address: string, tax_type: number, tax_name: *, status: *}}
 */
export function getSearchOption(tax_name, status, address, category, tax_id) {
  const option = {
    tax_name,
    status,
    tax_type: 2,
    address: JSON.stringify(
      address.map((value) => {
        if (tax_id) {
          value.tax_rate_id = tax_id
        }
        const { address_id } = value
        return Object.assign({}, value, {
          address_id: convertSid2Number(address_id),
        })
      })
    ),
  }
  let spu = []
  category.forEach((item) => {
    spu = spu.concat(
      item.children.map((value) => {
        const { spu_id, spu_name, tax_rate } = value
        const option = {
          spu_id,
          spu_name,
          tax_rate,
        }
        if (tax_id) {
          option.tax_rate_id = tax_id
        }
        return option
      })
    )
  })
  option.spu = JSON.stringify(spu)
  if (tax_id) {
    option.tax_id = tax_id
  }
  return option
}
