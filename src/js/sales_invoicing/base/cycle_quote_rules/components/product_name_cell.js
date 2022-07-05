import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gmfe/keyboard'
import { TableXUtil } from '@gmfe/table-x'

import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../store/detail'
import { formatList } from '../util'
const { TABLE_X } = TableXUtil

function ProductNameCell(props) {
  const { index, sku_id, sku_name } = props
  const { sku_details } = store
  // 获取已添加的商品id，搜索时过滤这些商品
  const skuIds = sku_details.slice().map(({ sku_id }) => sku_id)
  const [skuList, setSkuList] = useState([])

  let selectedSpec = _.find(skuList, (v) => v.value === sku_id)
  // 编辑初始时没有skuList，所以selectedSpec为null，但sku_id和sku_name是存在的，故加上初始值
  if (!selectedSpec && sku_id) {
    selectedSpec = { value: sku_id, text: sku_name }
  }
  // 清空选中时selected为undefined, 故加上默认空对象
  function handleSelect(selected = {}) {
    store.changeSkuPruduct(index, selected)
  }

  function handleSearch(text) {
    if (_.trim(text)) {
      store.searchSku(text).then(({ purchase_spec }) => {
        const skuList = formatList({
          list: purchase_spec,
          textField: 'name',
          valueField: 'id',
          filterIds: skuIds,
        })
        setSkuList(skuList)
      })
    }
  }

  return (
    <KCMoreSelect
      style={{
        width: TABLE_X.WIDTH_SEARCH,
      }}
      data={skuList}
      selected={selectedSpec}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder={t('输入商品ID或者商品名')}
    />
  )
}

ProductNameCell.propTypes = {
  sku_id: PropTypes.string,
  sku_name: PropTypes.string,
  index: PropTypes.number.isRequired,
}

export default observer(ProductNameCell)
