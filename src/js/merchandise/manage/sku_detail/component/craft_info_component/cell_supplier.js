import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gmfe/keyboard'

import { t } from 'gm-i18n'
import skuStore from '../../sku_store'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import { Request } from '@gm-common/request'

const { TABLE_X } = TableXUtil

const CellSupplier = observer((props) => {
  const { data, index } = props

  const [supplierList, setSupplierList] = useState([])

  useEffect(() => {
    // 原料才请求供应商
    if (data.spu_id && data.remark_type === 1) {
      Request('/product/sku_supplier/list_new')
        .data({ spu_id: data.spu_id })
        .get()
        .then(({ data: jsonData }) => {
          const list = {
            recommend_suppliers: jsonData.recommend_suppliers,
            other_suppliers: jsonData.other_suppliers,
          }
          const spuSupplierList = Object.entries(list).map(([key, value]) => {
            return {
              label:
                key === 'other_suppliers' ? t('其他供应商') : t('推荐供应商'),
              children: value.map((item) => ({
                value: item.id,
                text: item.name,
                upstream: item.upstream,
              })),
            }
          })

          setSupplierList(spuSupplierList)
        })
    }
  }, [data.spu_id, data.remark_type])

  // 若商品类型为净菜，则不需要选择供应商
  if (data.remark_type !== 1) return '-'

  const handleSelect = (selected) => {
    skuStore.changeIngredients(index, { supplier_id: selected?.value })
  }

  let selectedSku = null
  if (data.supplier_id) {
    const allSupplier = [].concat.apply(
      [],
      supplierList.map((item) => item.children),
    )

    selectedSku = allSupplier.find((item) => item.value === data.supplier_id)
  }

  return (
    <KCMoreSelect
      style={{
        width: TABLE_X.WIDTH_SEARCH,
      }}
      data={supplierList}
      selected={selectedSku}
      onSelect={handleSelect}
      placeholder={t('搜索')}
      renderListFilterType='pinyin'
      isGroupList
    />
  )
})

CellSupplier.propTypes = {
  index: PropTypes.number.isRequired,
  data: PropTypes.object,
}

export default memoComponentWithDataHoc(CellSupplier)
