import React, { useState } from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { KCMoreSelect } from '@gmfe/keyboard'
import memoComponentHoc from './memo_component'
import { Tip } from '@gmfe/react'
import { TableUtil } from '@gmfe/table'
const { referOfWidth } = TableUtil

const ProductNameCell = observer(({ index, data }) => {
  const { id, name } = data
  const [skuList, setSkuList] = useState([])

  const hasSameSelected = (selected) => {
    const { outStockList } = store
    return (
      _.filter(outStockList, (item) => {
        return item.id === selected
      }).length > 0
    )
  }

  const handleSelect = (selected) => {
    // 切换需清空批次信息
    store.clearTableBatchSelected(index)

    // 防止选择一样的sku
    if (!selected || !hasSameSelected(selected.value)) {
      store.changeProductNameSelected(index, selected)
      store.autoFetchBatchList(index)
    } else {
      Tip.info(t('所选商品已存在'))
    }
  }

  const handleSearch = (value) => {
    if (_.trim(value)) {
      return store.fetchSkuList(index, value).then((data) => setSkuList(data))
    }
  }

  let selected = null

  if (id && name) {
    selected = {
      value: id,
      text: name,
    }
  }

  return (
    <KCMoreSelect
      style={{
        width: referOfWidth.searchBox,
      }}
      data={skuList}
      isGroupList
      selected={selected}
      onSelect={(value) => handleSelect(value)}
      onSearch={(value) => handleSearch(value)}
      renderListFilter={(data) => {
        return data
      }}
      // onFocus={() => handleFocus()} // todo 原来是重新拉取数据
      placeholder={t('请输入商品名搜索')}
    />
  )
})

export default memoComponentHoc(ProductNameCell)
