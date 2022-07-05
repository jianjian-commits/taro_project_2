import { Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import { isNil } from 'lodash'

/**
 * @return {boolean}
 */
export function checkData({ tax_rule_name, supplier, category }) {
  let result = true
  if (!tax_rule_name) {
    Tip.warning(t('请输入税率规则名'))
    result = false
  }
  if (!supplier.length) {
    Tip.warning(t('请选择供应商'))
    result = false
  }
  if (!category.length) {
    Tip.warning(t('请选择商品'))
    result = false
  }
  if (
    category.some((item) =>
      item.children.some((child) => isNil(child.tax_rate))
    )
  ) {
    Tip.warning(t('请输入税率'))
    result = false
  }

  return result
}

/**
 * @param tax_name {string}
 * @param supplier {Array}
 * @param status {number}
 * @param category {Array}
 * @param tax_id {string?}
 * @return {{tax_type: number, tax_name: string, supplier_ids?: string, status: number,suppliers?:Object[]}}
 */
export function getSearchOption(tax_name, supplier, status, category, tax_id) {
  const option = {
    tax_name,
    tax_type: 1,
    status,
  }
  if (tax_id) {
    option.suppliers = JSON.stringify(
      supplier.map((value) => {
        const { supplier_id } = value
        return { supplier_id, tax_rate_id: tax_id }
      })
    )
  } else {
    option.supplier_ids = JSON.stringify(
      supplier.map((value) => value.supplier_id)
    )
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
